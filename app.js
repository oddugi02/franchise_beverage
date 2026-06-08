const screens = {
  home: document.getElementById("screen-home"),
  brand: document.getElementById("screen-brand"),
  detail: document.getElementById("screen-detail"),
  report: document.getElementById("screen-report"),
  "report-form": document.getElementById("screen-report-form"),
};

const homeBrands = document.getElementById("home-brands");
const homeCategoryTabs = document.getElementById("home-category-tabs");
const homeMenusRoot = document.getElementById("home-menus-root");
const brandHeaderRoot = document.getElementById("brand-header-root");
const brandMenuGrid = document.getElementById("brand-menu-grid");
const detailRoot = document.getElementById("detail-root");
const homeSearch = document.getElementById("home-search");
const detailBack = document.getElementById("detail-back");

let searchQuery = "";
let selectedBrandName = null;
let selectedCategory = "전체";

function getBaseUrl() {
  const cfg = getSiteConfig();
  return (cfg.siteUrl || window.location.origin).replace(/\/$/, "");
}

function resolveOgImage() {
  const cfg = getSiteConfig();
  const img = cfg.ogImage || "/og-image.svg";
  if (/^https?:\/\//.test(img)) return img;
  return `${getBaseUrl()}${img.startsWith("/") ? img : `/${img}`}`;
}

function setMetaContent(id, content) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("content", content);
}

function updatePageMeta({ menu = null } = {}) {
  const siteName = getSiteConfig().siteName || "홈카페";
  const ogImage = resolveOgImage();
  let title;
  let description;
  let url;

  if (menu) {
    title = `${menu.brand} ${menu.name} 집 레시피 | ${siteName}`;
    const savings = getSavings(menu);
    description = `매장 ${formatWon(menu.price)} → 집 ${formatWon(getHomePrice(menu))} (약 ${formatWon(savings)} 절약). ${menu.brand} ${menu.name} 따라 만들기.`;
    url = `${getBaseUrl()}/?menu=${menu.id}`;
  } else {
    title = `${siteName} — 프랜차이즈 음료 원가 + 레시피`;
    description = `프랜차이즈 음료를 집에서 만드는 레시피와 매장 대비 절약 금액. ${getRecipeReadyCount()}개 메뉴 · 알바 제보·교차검증.`;
    url = `${getBaseUrl()}/`;
  }

  document.title = title;
  setMetaContent("meta-description", description);
  setMetaContent("og-title", title);
  setMetaContent("og-description", description);
  setMetaContent("og-url", url);
  setMetaContent("og-image", ogImage);
  setMetaContent("twitter-title", title);
  setMetaContent("twitter-description", description);
  setMetaContent("twitter-image", ogImage);
  const canonical = document.getElementById("canonical-url");
  if (canonical) canonical.href = url;
}

function renderMenuMetaBlock() {
  const level = getVerificationLevel(getMenuMeta().verification);
  return `<div class="menu-meta menu-meta--badge-only"><span class="status-badge ${level.badgeClass}">${level.label}</span></div>`;
}

function openMenuDetail(id) {
  const menu = MENUS.find((m) => m.id === id);
  if (!menu) return;

  renderDetail(id);
  navigate("detail", { skipUrl: true });

  const url = new URL(window.location.href);
  url.searchParams.set("menu", id);
  history.pushState({ screen: "detail", menu: id }, "", url);
  updatePageMeta({ menu });
  MenuStats.trackView(id).then(() => MenuStats.updateStatsDom(id));
}

function clearMenuUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("menu")) return;
  url.searchParams.delete("menu");
  history.replaceState({ screen: "home" }, "", url.pathname + url.search);
}

function initAppRoute() {
  window.addEventListener("popstate", () => {
    const menuId = new URLSearchParams(window.location.search).get("menu");
    const menu = MENUS.find((m) => m.id === menuId);

    if (menu) {
      renderDetail(menu.id);
      navigate("detail", { skipUrl: true });
      updatePageMeta({ menu });
      MenuStats.trackView(menu.id).then(() => MenuStats.updateStatsDom(menu.id));
      return;
    }

    Object.values(screens).forEach((el) => {
      if (el) el.classList.remove("screen--active");
    });
    if (screens.home) screens.home.classList.add("screen--active");
    renderHome();
    updatePageMeta();
  });
}

async function bootApp() {
  bindNavButtons();
  initReportForm();
  initMenuRequestModal();
  initMenuStats();
  initAppRoute();

  await MenuStats.init();

  const menuId = new URLSearchParams(window.location.search).get("menu");
  const menu = MENUS.find((m) => m.id === menuId);
  if (menu) {
    renderDetail(menu.id);
    navigate("detail", { skipUrl: true });
    updatePageMeta({ menu });
    MenuStats.trackView(menu.id).then(() => MenuStats.updateStatsDom(menu.id));
    return;
  }

  renderHome();
  updatePageMeta();
}

function initMenuStats() {
  document.addEventListener("click", async (e) => {
    const likeBtn = e.target.closest("[data-like-menu]");
    if (likeBtn && !likeBtn.disabled) {
      e.stopPropagation();
      e.preventDefault();

      const menuId = likeBtn.dataset.likeMenu;
      likeBtn.disabled = true;

      try {
        await MenuStats.toggleLike(menuId);
        MenuStats.updateStatsDom(menuId);
      } finally {
        likeBtn.disabled = false;
      }
      return;
    }

    const copyBtn = e.target.closest("[data-copy-menu-link]");
    if (!copyBtn || copyBtn.disabled) return;
    e.stopPropagation();
    e.preventDefault();

    const menuId = copyBtn.dataset.copyMenuLink;
    const url = `${getBaseUrl()}/?menu=${menuId}`;
    const label = copyBtn.querySelector(".menu-action__label");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      copyBtn.classList.add("is-copied");
      if (label) label.textContent = "복사됨";
      window.setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        if (label) label.textContent = "링크 복사";
      }, 1800);
    } catch {
      if (label) label.textContent = "복사 실패";
      window.setTimeout(() => {
        if (label) label.textContent = "링크 복사";
      }, 1800);
    }
  });
}

function navigate(name, options = {}) {
  Object.values(screens).forEach((el) => {
    if (el) el.classList.remove("screen--active");
  });
  if (screens[name]) screens[name].classList.add("screen--active");
  if (name === "report-form") {
    resetReportForm();
    if (options.prefill) prefillReportForm(options.prefill);
  }
  if (name === "home") {
    selectedBrandName = null;
    if (!options.skipUrl) {
      clearMenuUrl();
      updatePageMeta();
    }
  }
  window.scrollTo(0, 0);
}

function bindNavButtons() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-nav]");
    if (!el) return;
    const prefill =
      el.dataset.prefillBrand && el.dataset.prefillMenu
        ? {
            brand: el.dataset.prefillBrand,
            menu: el.dataset.prefillMenu,
            price: el.dataset.prefillPrice || null,
          }
        : null;
    navigate(el.dataset.nav, { prefill });
  });
}

function renderMenuCard(menu, options = {}) {
  const brandLine = options.showBrand
    ? `<p class="menu-card__brand">${menu.brand}</p>`
    : "";

  const badges = [];
  if (menu.discontinued) {
    badges.push(`<span class="discontinued-badge">단종</span>`);
  }
  if (menu.recipeReady) {
    badges.push(`<span class="save-badge">집에서 ${formatWon(getHomePrice(menu))}</span>`);
  } else if (!menu.discontinued) {
    badges.push(`<span class="soon-badge">레시피 준비중</span>`);
  }
  const badge = badges.length
    ? `<div class="menu-card__badges">${badges.join("")}</div>`
    : "";

  return `
    <article class="menu-card" data-id="${menu.id}">
      <div class="menu-card__photo" style="background:${menu.photoBg}">${menu.emoji}</div>
      <div class="menu-card__body">
        ${brandLine}
        <h3 class="menu-card__name">${menu.name}</h3>
        <div class="menu-card__foot">
          <span class="menu-card__price">${formatWon(menu.price)}</span>
          ${badge}
        </div>
      </div>
    </article>
  `;
}

function bindMenuCards(container) {
  container.querySelectorAll(".menu-card").forEach((card) => {
    card.addEventListener("click", () => {
      openMenuDetail(card.dataset.id);
    });
  });
}

function renderHome() {
  const q = searchQuery.trim().toLowerCase();
  const brands = getBrands().filter(
    (b) => !q || b.name.toLowerCase().includes(q)
  );

  if (!brands.length) {
    homeBrands.innerHTML = `<p class="empty-msg empty-msg--compact">일치하는 브랜드가 없습니다.</p>`;
  } else {
    homeBrands.innerHTML = brands
      .map(
        (brand) => `
    <button type="button" class="brand-square" data-brand="${brand.name}">
      <span class="brand-square__logo" style="background:${brand.logoBg};color:${brand.logoColor}">${brand.logo}</span>
      <span class="brand-square__name">${brand.name}</span>
    </button>
  `
      )
      .join("");

    homeBrands.querySelectorAll(".brand-square").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedBrandName = btn.dataset.brand;
        renderBrand(selectedBrandName);
        navigate("brand");
      });
    });
  }

  renderHomeMenus();
}

function getHomeMenus() {
  const q = searchQuery.trim().toLowerCase();
  return MENUS.filter((menu) => {
    const matchSearch =
      !q ||
      menu.name.toLowerCase().includes(q) ||
      menu.brand.toLowerCase().includes(q);
    const matchCategory =
      selectedCategory === "전체" || menu.category === selectedCategory;
    return matchSearch && matchCategory;
  });
}

function renderCategoryTabs() {
  if (!homeCategoryTabs) return;

  homeCategoryTabs.innerHTML = CATEGORIES.map(
    (cat) => `
    <button type="button" class="category-tab${cat === selectedCategory ? " category-tab--active" : ""}" data-category="${cat}">${cat}</button>
  `
  ).join("");

  homeCategoryTabs.querySelectorAll(".category-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedCategory = btn.dataset.category;
      renderHomeMenus();
    });
  });
}

function renderHomeMenus() {
  if (!homeMenusRoot) return;

  renderCategoryTabs();
  const menus = getHomeMenus();

  if (!menus.length) {
    homeMenusRoot.innerHTML = `<p class="empty-msg">검색 결과가 없습니다.</p>`;
    return;
  }

  if (selectedCategory !== "전체") {
    homeMenusRoot.innerHTML = `
      <div class="menu-grid">${menus.map((menu) => renderMenuCard(menu, { showBrand: true })).join("")}</div>
    `;
    bindMenuCards(homeMenusRoot);
    return;
  }

  const sections = CATEGORIES.slice(1)
    .map((category) => {
      const categoryMenus = menus.filter((menu) => menu.category === category);
      if (!categoryMenus.length) return "";

      return `
        <section class="category-section">
          <div class="category-section__head">
            <h2 class="category-section__title">${category}</h2>
            <span class="category-section__count">${categoryMenus.length}개</span>
          </div>
          <div class="menu-grid">
            ${categoryMenus.map((menu) => renderMenuCard(menu, { showBrand: true })).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  homeMenusRoot.innerHTML = sections;
  bindMenuCards(homeMenusRoot);
}

function renderBrand(brandName) {
  const brand = getBrandByName(brandName);
  const menus = MENUS.filter((m) => m.brand === brandName);

  if (brand) {
    brandHeaderRoot.innerHTML = `
      <div class="brand-page-header">
        <span class="brand-page-header__logo" style="background:${brand.logoBg};color:${brand.logoColor}">${brand.logo}</span>
        <div>
          <h2 class="brand-page-header__name">${brand.name}</h2>
          <p class="brand-page-header__count">${menus.length}개 메뉴</p>
        </div>
      </div>
    `;
  } else {
    brandHeaderRoot.innerHTML = `<h2 class="brand-page-header__name">${brandName}</h2>`;
  }

  brandMenuGrid.innerHTML = menus.map(renderMenuCard).join("");
  bindMenuCards(brandMenuGrid);
}

function renderStars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderDetail(id) {
  const menu = MENUS.find((m) => m.id === id) || MENUS[0];
  selectedBrandName = menu.brand;

  if (detailBack) {
    detailBack.onclick = () => {
      clearMenuUrl();
      updatePageMeta();
      renderBrand(selectedBrandName);
      navigate("brand", { skipUrl: true });
    };
  }

  if (!menu.recipeReady) {
    detailRoot.innerHTML = `
      <div class="detail-page">
        ${renderMenuMetaBlock(menu)}
        <div class="detail-soon card-box">
          <div class="detail-soon__icon">${menu.emoji}</div>
          <p class="detail-soon__brand">${menu.brand}</p>
          <h2 class="detail-soon__name">${menu.name}</h2>
          <p class="detail-soon__price">판매가 ${formatWon(menu.price)}</p>
          <p class="detail-soon__text">레시피 준비중</p>
          <p class="detail-soon__sub">원가·레시피 정보를 수집하고 있어요.</p>
        </div>
      </div>
    `;
    return;
  }

  const homePrice = getHomePortionPrice(menu);
  const savings = getSavings(menu);
  const homeSaveRatio = getHomeSaveRatio(menu);
  const shoppingList = getHomeShoppingList(menu);
  const homeItems =
    typeof getHomePortionList === "function" ? getHomePortionList(menu) : getHomeIngredients(menu);
  const recipeSteps =
    typeof getRecipeStepsFromShopping === "function"
      ? getRecipeStepsFromShopping(menu)
      : menu.recipe?.steps || [];

  const storeRows = getStoreIngredients(menu)
    .map(
      (ing) => `
      <tr>
        <td>${ing.name}</td>
        <td>${ing.amount}</td>
      </tr>
    `
    )
    .join("");

  const shoppingVerifiedAt =
    typeof SHOPPING_VERIFIED_AT !== "undefined" ? SHOPPING_VERIFIED_AT : null;
  const shoppingVerifiedNote = shoppingVerifiedAt
    ? ` · 기준일 ${shoppingVerifiedAt}`
    : "";

  const shoppingRows = shoppingList
    .map((item) => {
      const storeCell = item.store
        ? `<span class="home-ingredient-row__store-badge">${item.store}</span>`
        : '<span class="home-ingredient-row__store--na">—</span>';
      return `
      <tr class="home-ingredient-row">
        <td class="home-ingredient-row__buy-name">${item.buy}</td>
        <td class="home-ingredient-row__store">${storeCell}</td>
      </tr>
    `;
    })
    .join("");

  const recipeIngredientSummary = homeItems
    .map(
      (item) =>
        item.recipeDisplay ||
        item.display ||
        `${item.label} ${item.amount && item.amount !== "-" ? item.amount : ""}`.trim()
    )
    .join(" · ");

  const portionRows = homeItems
    .map((item) => {
      const priceCell =
        item.priced || (item.price != null && item.price > 0)
          ? formatWon(item.price)
          : '<span class="home-ingredient-row__price--na">—</span>';
      return `
      <tr class="home-ingredient-row">
        <td class="home-ingredient-row__name">${item.recipeName || item.label}</td>
        <td class="home-ingredient-row__amount">${item.amount || "-"}</td>
        <td class="home-ingredient-row__price">${priceCell}</td>
      </tr>
    `;
    })
    .join("");

  const polishStep =
    typeof globalThis.toFriendlyHadaStep === "function"
      ? globalThis.toFriendlyHadaStep
      : (text) => (text || "").trim();

  const steps = recipeSteps
    .filter((step) => !/^매장/.test(step.title || ""))
    .filter((step) => step.title !== "토핑")
    .filter((step) => !(step.body || "").trim().startsWith("재료:"))
    .map(
      (step, i) => `
      <li class="recipe-step">
        <span class="recipe-step__num">${i + 1}</span>
        <div>
          <p>${polishStep(step.body)}</p>
        </div>
      </li>
    `
    )
    .join("");

  const discontinuedLine = menu.discontinued
    ? `<p class="detail-summary__discontinued">단종 메뉴</p>`
    : "";

  detailRoot.innerHTML = `
    <div class="detail-page">
      <article class="detail-summary">
        <div class="detail-summary__icon" style="background:${menu.photoBg}">${menu.emoji}</div>
        <div class="detail-summary__main">
          <p class="detail-summary__brand">${menu.brand}</p>
          <h2 class="detail-summary__name">${menu.name}</h2>
          ${discontinuedLine}
          <p class="detail-summary__price">판매가 ${formatWon(menu.price)}</p>
          ${typeof MenuStats !== "undefined" ? MenuStats.renderStatsHtml(menu.id, { interactive: true }) : ""}
        </div>
      </article>

      ${renderMenuMetaBlock(menu)}

      <div class="detail-hero card-box">
        <p class="detail-hero__save">약 ${formatWon(savings)} 절약</p>
        <p class="detail-hero__sub">매장 ${formatWon(menu.price)} → 집 ${formatWon(homePrice)} · ${homeSaveRatio.toFixed(1)}배</p>
      </div>

      <article class="recipe-panel card-box">
        <div class="recipe-panel__head">
          <h3>집에서 만들기</h3>
        </div>

        <div class="recipe-section">
          <h4 class="recipe-subtitle">장보기 목록</h4>
          <p class="recipe-section-desc">${HOME_SHOPPING_NOTE}${shoppingVerifiedNote}</p>
          <table class="home-ingredient-table home-ingredient-table--shop">
            <thead>
              <tr>
                <th>재료</th>
                <th class="col-store">최저가 구매처</th>
              </tr>
            </thead>
            <tbody>${shoppingRows}</tbody>
          </table>
        </div>

        <div class="recipe-section">
          <h4 class="recipe-subtitle">1회 사용</h4>
          <p class="recipe-section-desc">장보기 목록과 동일한 구매명 · 1잔 분량</p>
          <table class="home-ingredient-table home-ingredient-table--portion">
            <thead>
              <tr>
                <th>재료명</th>
                <th>사용량</th>
                <th class="col-cost">판매가</th>
              </tr>
            </thead>
            <tbody>${portionRows}</tbody>
          </table>
          <div class="home-ingredient-total">
            <span class="home-ingredient-total__label">1회 사용 총 판매가</span>
            <strong class="home-ingredient-total__value">${formatWon(homePrice)}</strong>
          </div>
        </div>

        <div class="recipe-section">
          <div class="recipe-subtitle-row">
            <h4 class="recipe-subtitle">만드는 방법</h4>
            <span class="recipe-time">
              <svg class="recipe-time__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${menu.recipe.time}
            </span>
          </div>
          <p class="recipe-section-desc">${HOME_RECIPE_SOURCE_NOTE}</p>
          <p class="recipe-ingredient-summary">${recipeIngredientSummary}</p>
          <ol class="recipe-steps">${steps}</ol>
          <div class="recipe-meta">
            <span>난이도 ${renderStars(menu.recipe.difficulty)}</span>
            <span>${menu.recipe.note}</span>
          </div>
        </div>
      </article>

      <details class="store-analysis card-box">
        <summary class="store-analysis__summary">
          <strong class="store-analysis__title">매장 원재료 분석</strong>
          <span class="store-analysis__chevron" aria-hidden="true">▼</span>
        </summary>
        <div class="store-analysis__body">
          <p class="store-analysis__desc">${STORE_INGREDIENT_NOTE}</p>
          <table class="ingredient-table">
            <thead>
              <tr>
                <th>재료명</th>
                <th>함량</th>
              </tr>
            </thead>
            <tbody>${storeRows}</tbody>
          </table>
        </div>
      </details>
    </div>
  `;
}

function getSiteConfig() {
  return window.SITE_CONFIG || {};
}

function hasSupabase() {
  const cfg = getSiteConfig();
  return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
}

function supabaseHeaders() {
  const key = getSiteConfig().supabaseAnonKey;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function getFormSubmitAction() {
  const cfg = getSiteConfig();
  const endpoint = (cfg.formSubmitEndpoint || cfg.operatorEmail || "").trim();
  if (!endpoint) {
    throw new Error("운영자 이메일이 설정되지 않았습니다. config.js에 operatorEmail을 입력해 주세요.");
  }
  return `https://formsubmit.co/${endpoint}`;
}

async function submitMenuRequestToSupabase({ brand, menu, note, contact }) {
  const base = getSiteConfig().supabaseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1/menu_requests`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      brand,
      menu_name: menu,
      note: note || null,
      contact: contact || null,
    }),
  });
  if (!res.ok) {
    throw new Error("요청 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

function showMenuRequestSuccess(channel) {
  const noteEl = document.getElementById("menu-request-success-note");
  if (!noteEl) return;

  if (channel === "formsubmit") {
    const email = getSiteConfig().operatorEmail?.trim() || "운영자 메일";
    noteEl.innerHTML = `FormSubmit 첫 사용 시 <strong>${email}</strong>으로 <strong>「Activate Form」</strong> 확인 메일이 옵니다. 링크를 한 번 눌러 활성화해야 요청 내용이 메일로 전달됩니다. 스팸함도 확인해 주세요.`;
    noteEl.hidden = false;
  } else {
    noteEl.hidden = true;
    noteEl.textContent = "";
  }
}

function openMenuRequestModal(prefill = {}) {
  const modal = document.getElementById("menu-request-modal");
  const form = document.getElementById("menu-request-form");
  const success = document.getElementById("menu-request-success");
  const errorEl = document.getElementById("menu-request-error");
  if (!modal || !form) return;

  form.reset();
  form.hidden = false;
  if (success) success.hidden = true;
  const successNote = document.getElementById("menu-request-success-note");
  if (successNote) {
    successNote.hidden = true;
    successNote.textContent = "";
  }
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  const brandInput = document.getElementById("request-brand");
  const menuInput = document.getElementById("request-menu");
  if (brandInput && prefill.brand) brandInput.value = prefill.brand;
  if (menuInput && prefill.menu) menuInput.value = prefill.menu;

  modal.hidden = false;
  document.body.classList.add("modal-open");
  (brandInput && !prefill.brand ? brandInput : menuInput)?.focus();
}

function closeMenuRequestModal() {
  const modal = document.getElementById("menu-request-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function submitMenuRequest(form) {
  const brand = form.brand.value.trim();
  const menu = form.menu.value.trim();
  const note = form.note.value.trim();
  const contact = form.contact.value.trim();

  if (hasSupabase()) {
    await submitMenuRequestToSupabase({ brand, menu, note, contact });
    return { channel: "supabase" };
  }

  const payload = {
    _subject: `[홈카페] 메뉴 요청: ${brand} · ${menu}`,
    _template: "table",
    _captcha: "false",
    form_type: "메뉴 레시피 등록 요청",
    브랜드: brand,
    메뉴명: menu,
    "추가 정보": note || "(없음)",
    "연락처 (선택)": contact || "(없음)",
  };

  // fetch(AJAX)는 file://·일부 배포 환경에서 CORS로 막힘 → iframe 폼 POST 사용
  await submitViaFormPost(getFormSubmitAction(), payload);
  return { channel: "formsubmit" };
}

function submitViaFormPost(action, fields) {
  return new Promise((resolve, reject) => {
    const frameName = "menu-request-formsubmit";
    let iframe = document.getElementById(frameName);
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = frameName;
      iframe.name = frameName;
      iframe.title = "요청 전송";
      iframe.hidden = true;
      document.body.appendChild(iframe);
    }

    const tempForm = document.createElement("form");
    tempForm.method = "POST";
    tempForm.action = action;
    tempForm.target = frameName;
    tempForm.style.display = "none";

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      tempForm.appendChild(input);
    });

    let settled = false;
    const finish = (ok, err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      tempForm.remove();
      iframe.onload = null;
      if (ok) resolve();
      else reject(err);
    };

    // FormSubmit 응답 페이지 로드 전에도 전송은 완료됨
    const timer = setTimeout(() => finish(true), 3500);
    iframe.onload = () => finish(true);
    iframe.onerror = () => finish(false, new Error("요청 전송에 실패했습니다. 잠시 후 다시 시도해 주세요."));

    document.body.appendChild(tempForm);
    tempForm.submit();
  });
}

function initMenuRequestModal() {
  const modal = document.getElementById("menu-request-modal");
  const form = document.getElementById("menu-request-form");
  const openBtn = document.getElementById("btn-menu-request");
  const cancelBtn = document.getElementById("menu-request-cancel");
  const doneBtn = document.getElementById("menu-request-done");
  const submitBtn = document.getElementById("menu-request-submit");
  const success = document.getElementById("menu-request-success");
  const errorEl = document.getElementById("menu-request-error");

  if (!modal || !form || !openBtn) return;

  openBtn.addEventListener("click", () => openMenuRequestModal());

  modal.querySelector(".app-modal__backdrop")?.addEventListener("click", closeMenuRequestModal);
  modal.querySelector(".app-modal__close")?.addEventListener("click", closeMenuRequestModal);
  cancelBtn?.addEventListener("click", closeMenuRequestModal);
  doneBtn?.addEventListener("click", closeMenuRequestModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeMenuRequestModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    const prevLabel = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "보내는 중…";
    }

    try {
      const result = await submitMenuRequest(form);
      showMenuRequestSuccess(result.channel);
      form.hidden = true;
      if (success) success.hidden = false;
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || "전송에 실패했습니다.";
        errorEl.hidden = false;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel || "요청 보내기";
      }
    }
  });
}

function createIngredientRow() {
  const tr = document.createElement("tr");
  tr.className = "ingredient-input-row";
  tr.innerHTML = `
    <td><input type="text" name="ingredient-name" placeholder="재료명" required /></td>
    <td><input type="text" name="ingredient-amount" placeholder="예: 200" required /></td>
    <td class="col-action"><button type="button" class="btn-row-remove" aria-label="행 삭제">×</button></td>
  `;
  return tr;
}

function updateRemoveButtons() {
  document.querySelectorAll(".ingredient-input-row").forEach((row) => {
    const btn = row.querySelector(".btn-row-remove");
    const rows = document.querySelectorAll(".ingredient-input-row");
    if (btn) btn.disabled = rows.length <= 1;
  });
}

function resetReportForm() {
  const form = document.getElementById("report-form");
  const success = document.getElementById("report-success");
  const tbody = document.getElementById("ingredient-input-rows");
  if (!form || !tbody) return;
  form.reset();
  form.hidden = false;
  if (success) success.hidden = true;
  tbody.innerHTML = "";
  tbody.appendChild(createIngredientRow());
  updateRemoveButtons();
}

function prefillReportForm({ brand, menu, price }) {
  const brandInput = document.getElementById("report-brand");
  const menuInput = document.getElementById("report-menu");
  const priceInput = document.getElementById("report-price");
  if (brandInput && brand) brandInput.value = brand;
  if (menuInput && menu) menuInput.value = menu;
  if (priceInput && price != null) priceInput.value = price;
}

function initReportForm() {
  const form = document.getElementById("report-form");
  const tbody = document.getElementById("ingredient-input-rows");
  const addBtn = document.getElementById("btn-add-ingredient");
  if (!form || !tbody || !addBtn) return;

  addBtn.addEventListener("click", () => {
    tbody.appendChild(createIngredientRow());
    updateRemoveButtons();
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-row-remove");
    if (!btn || btn.disabled) return;
    btn.closest(".ingredient-input-row")?.remove();
    updateRemoveButtons();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.hidden = true;
    const success = document.getElementById("report-success");
    if (success) success.hidden = false;
  });

  resetReportForm();
}

if (homeSearch) {
  homeSearch.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderHome();
  });
}

bootApp();
