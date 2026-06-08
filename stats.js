// 메뉴 조회수·좋아요 — Supabase(전역) + localStorage(폴백)
(function () {
  const LS_STATS = "copycat_menu_stats";
  const LS_LIKED = "copycat_liked_menus";
  const SS_VIEWED = "copycat_viewed_session";

  let cache = {};
  const listeners = new Set();

  function getConfig() {
    return window.SITE_CONFIG || {};
  }

  function hasRemote() {
    const cfg = getConfig();
    return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  }

  function remoteHeaders() {
    const key = getConfig().supabaseAnonKey;
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    };
  }

  function readLocalStats() {
    try {
      return JSON.parse(localStorage.getItem(LS_STATS) || "{}");
    } catch {
      return {};
    }
  }

  function writeLocalStats(stats) {
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
  }

  function readLikedSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS_LIKED) || "[]"));
    } catch {
      return new Set();
    }
  }

  function writeLikedSet(set) {
    localStorage.setItem(LS_LIKED, JSON.stringify([...set]));
  }

  function normalizeRow(row) {
    return {
      views: Number(row?.views) || 0,
      likes: Number(row?.likes) || 0,
    };
  }

  function setCacheFromMap(map) {
    cache = {};
    Object.entries(map).forEach(([menuId, row]) => {
      cache[menuId] = normalizeRow(row);
    });
    notify();
  }

  function mergeCache(map) {
    Object.entries(map).forEach(([menuId, row]) => {
      cache[menuId] = normalizeRow(row);
    });
    notify();
  }

  function notify() {
    listeners.forEach((fn) => fn(getAllStats()));
  }

  function getStats(menuId) {
    return cache[menuId] ? { ...cache[menuId] } : { views: 0, likes: 0 };
  }

  function getAllStats() {
    return { ...cache };
  }

  function getPopularityScore(menuId) {
    const s = getStats(menuId);
    return s.views + s.likes;
  }

  function isLiked(menuId) {
    return readLikedSet().has(menuId);
  }

  async function fetchRemoteStats() {
    const base = getConfig().supabaseUrl.replace(/\/$/, "");
    const res = await fetch(`${base}/rest/v1/menu_stats?select=menu_id,views,likes`, {
      headers: remoteHeaders(),
    });
    if (!res.ok) throw new Error("stats fetch failed");
    const rows = await res.json();
    const map = {};
    rows.forEach((row) => {
      map[row.menu_id] = { views: row.views, likes: row.likes };
    });
    return map;
  }

  async function rpc(name, body) {
    const base = getConfig().supabaseUrl.replace(/\/$/, "");
    const res = await fetch(`${base}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { ...remoteHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`rpc ${name} failed`);
  }

  async function refresh() {
    if (hasRemote()) {
      try {
        const map = await fetchRemoteStats();
        mergeCache(map);
        return;
      } catch {
        /* fall through to local */
      }
    }
    mergeCache(readLocalStats());
  }

  async function init() {
    if (hasRemote()) {
      try {
        const map = await fetchRemoteStats();
        setCacheFromMap(map);
      } catch {
        setCacheFromMap(readLocalStats());
      }
    } else {
      setCacheFromMap(readLocalStats());
    }
  }

  function bumpLocal(menuId, field, delta) {
    const stats = readLocalStats();
    const current = normalizeRow(stats[menuId]);
    current[field] = Math.max(0, current[field] + delta);
    stats[menuId] = current;
    writeLocalStats(stats);
    cache[menuId] = current;
    notify();
  }

  async function trackView(menuId) {
    if (!menuId) return;

    let viewed = [];
    try {
      viewed = JSON.parse(sessionStorage.getItem(SS_VIEWED) || "[]");
    } catch {
      viewed = [];
    }
    if (viewed.includes(menuId)) return;
    viewed.push(menuId);
    sessionStorage.setItem(SS_VIEWED, JSON.stringify(viewed));

    if (hasRemote()) {
      try {
        await rpc("increment_menu_view", { p_menu_id: menuId });
        await refresh();
        return;
      } catch {
        /* local fallback */
      }
    }

    bumpLocal(menuId, "views", 1);
  }

  async function toggleLike(menuId) {
    if (!menuId) return isLiked(menuId);

    const liked = readLikedSet();
    const nowLiked = !liked.has(menuId);
    const delta = nowLiked ? 1 : -1;

    if (nowLiked) liked.add(menuId);
    else liked.delete(menuId);
    writeLikedSet(liked);

    bumpLocal(menuId, "likes", delta);

    if (hasRemote()) {
      try {
        await rpc(nowLiked ? "increment_menu_like" : "decrement_menu_like", {
          p_menu_id: menuId,
        });
        await refresh();
      } catch {
        /* 로컬 bumpLocal 반영 유지 */
      }
    }

    return nowLiked;
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  const ICON_HEART = `<svg class="menu-action__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10.5c0 5.65-7 10-7 10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  const ICON_LINK = `<svg class="menu-action__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 5.93" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

  function renderStatsHtml(menuId, options = {}) {
    const stats = getStats(menuId);
    const liked = isLiked(menuId);
    const interactive = Boolean(options.interactive);

    const likeBtn = interactive
      ? `<button type="button" class="menu-action menu-action--like${liked ? " is-liked" : ""}" data-like-menu="${menuId}" aria-pressed="${liked}" aria-label="좋아요">
          ${ICON_HEART}
          <span class="menu-action__count" data-stat-likes="${menuId}">${stats.likes}</span>
        </button>`
      : `<span class="menu-action menu-action--like menu-action--static" aria-label="좋아요 ${stats.likes}">
          ${ICON_HEART}
          <span class="menu-action__count">${stats.likes}</span>
        </span>`;

    const copyBtn = interactive
      ? `<button type="button" class="menu-action menu-action--copy" data-copy-menu-link="${menuId}" aria-label="메뉴 링크 복사">
          ${ICON_LINK}
          <span class="menu-action__label">링크 복사</span>
        </button>`
      : "";

    return `<div class="menu-actions">${likeBtn}${copyBtn}</div>`;
  }

  function updateStatsDom(menuId) {
    const stats = getStats(menuId);
    document.querySelectorAll(`[data-stat-likes="${menuId}"]`).forEach((el) => {
      el.textContent = stats.likes;
    });
    document.querySelectorAll(`[data-like-menu="${menuId}"]`).forEach((btn) => {
      const liked = isLiked(menuId);
      btn.classList.toggle("is-liked", liked);
      btn.setAttribute("aria-pressed", String(liked));
    });
  }

  globalThis.MenuStats = {
    init,
    refresh,
    trackView,
    toggleLike,
    isLiked,
    getStats,
    getAllStats,
    getPopularityScore,
    onChange,
    renderStatsHtml,
    updateStatsDom,
    hasRemote,
  };
})();
