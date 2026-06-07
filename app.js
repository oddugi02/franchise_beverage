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

function navigate(name, options = {}) {
  Object.values(screens).forEach((el) => {
    if (el) el.classList.remove("screen--active");
  });
  if (screens[name]) screens[name].classList.add("screen--active");
  if (name === "report-form") {
    resetReportForm();
    if (options.prefill) prefillReportForm(options.prefill);
  }
  if (name === "home") selectedBrandName = null;
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
      renderDetail(card.dataset.id);
      navigate("detail");
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
      renderBrand(selectedBrandName);
      navigate("brand");
    };
  }

  if (!menu.recipeReady) {
    detailRoot.innerHTML = `
      <div class="detail-soon card-box">
        <div class="detail-soon__icon">${menu.emoji}</div>
        <p class="detail-soon__brand">${menu.brand}</p>
        <h2 class="detail-soon__name">${menu.name}</h2>
        <p class="detail-soon__price">판매가 ${formatWon(menu.price)}</p>
        <p class="detail-soon__text">레시피 준비중</p>
        <p class="detail-soon__sub">원가·레시피 정보를 수집하고 있어요.</p>
      </div>
    `;
    return;
  }

  const totalCost = getTotalCost(menu);
  const homePrice = getHomePrice(menu);
  const savings = getSavings(menu);
  const costRatePct = getCostRatePct(menu);
  const markupRatio = getStoreMarkupRatio(menu);
  const homeSaveRatio = getHomeSaveRatio(menu);
  const villain = getVillainGrade(menu);
  const homeItems = getHomeIngredients(menu);

  const storeRows = menu.ingredients
    .map(
      (ing) => `
      <tr>
        <td>${ing.name}</td>
        <td>${ing.amount}</td>
        <td class="td-cost">${formatWon(ing.cost)}</td>
      </tr>
    `
    )
    .join("");

  const steps = menu.recipe.steps
    .map(
      (step, i) => `
      <li class="recipe-step">
        <span class="recipe-step__num">${i + 1}</span>
        <div>
          <strong>${step.title}</strong>
          <p>${step.body}</p>
        </div>
      </li>
    `
    )
    .join("");

  const homeIngredientRows = homeItems
    .map((item) => {
      const replacesText = formatReplaces(item.replaces);
      const replacesLine = replacesText
        ? `<span class="home-ingredient-item__replaces">↳ 매장 ${replacesText} 대체</span>`
        : "";
      return `
      <tr class="home-ingredient-row">
        <td class="home-ingredient-row__name">
          <span>${item.label}</span>
          ${replacesLine}
        </td>
        <td class="home-ingredient-row__amount">${item.amount || "-"}</td>
        <td class="home-ingredient-row__cost">${formatWon(item.cost)}</td>
      </tr>
    `;
    })
    .join("");

  const discontinuedLine = menu.discontinued
    ? `<p class="detail-summary__discontinued">단종 메뉴</p>`
    : "";

  detailRoot.innerHTML = `
    <div class="detail-page">
      <article class="detail-summary">
        <div class="detail-summary__icon" style="background:${menu.photoBg}">${menu.emoji}</div>
        <div>
          <p class="detail-summary__brand">${menu.brand}</p>
          <h2 class="detail-summary__name">${menu.name}</h2>
          ${discontinuedLine}
          <p class="detail-summary__price">판매가 ${formatWon(menu.price)}</p>
        </div>
      </article>

      <div class="detail-hero card-box">
        <p class="detail-hero__save">약 ${formatWon(savings)} 절약</p>
        <p class="detail-hero__sub">매장 ${formatWon(menu.price)} → 집 ${formatWon(homePrice)} · ${homeSaveRatio.toFixed(1)}배</p>
      </div>

      <article class="recipe-panel card-box">
        <div class="recipe-panel__head">
          <h3>집에서 만들기</h3>
        </div>

        <div class="recipe-section">
          <h4 class="recipe-subtitle">마트에서 살 재료</h4>
          <p class="recipe-section-desc">매장 전용 재료 대신 집에서 구할 수 있는 제품이에요</p>
          <table class="home-ingredient-table">
            <thead>
              <tr>
                <th>재료명</th>
                <th>함량</th>
                <th class="col-cost">원가</th>
              </tr>
            </thead>
            <tbody>${homeIngredientRows}</tbody>
          </table>
          <div class="home-ingredient-total">
            <span class="home-ingredient-total__label">집에서 총 비용</span>
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
          <ol class="recipe-steps">${steps}</ol>
          <div class="recipe-meta">
            <span>난이도 ${renderStars(menu.recipe.difficulty)}</span>
            <span>${menu.recipe.note}</span>
          </div>
        </div>
      </article>

      <details class="store-analysis card-box">
        <summary class="store-analysis__summary">
          <span class="store-analysis__leading">
            <strong class="store-analysis__title">매장 원재료 분석</strong>
            <span class="store-analysis__hint">매장 B2B 재료 기준</span>
          </span>
          <span class="store-analysis__meta">
            <span class="store-analysis__cost">총 원가 ${formatWon(totalCost)}</span>
            <span class="store-analysis__chevron" aria-hidden="true">▼</span>
          </span>
        </summary>
        <div class="store-analysis__body">
          <table class="ingredient-table">
            <thead>
              <tr>
                <th>재료명</th>
                <th>함량</th>
                <th class="col-cost">원가</th>
              </tr>
            </thead>
            <tbody>${storeRows}</tbody>
          </table>
          <div class="detail-table__foot">
            <span class="detail-table__foot-label">매장 총 원가</span>
            <p class="detail-table__foot-value">${formatWon(totalCost)}</p>
          </div>
          <div class="detail-cost-rate">
            <div class="detail-cost-rate__row">
              <span class="detail-cost-rate__label">원가율</span>
              <strong class="detail-cost-rate__pct">${costRatePct}%</strong>
              <span class="detail-cost-rate__markup">(원가보다 ${markupRatio.toFixed(1)}배 비싸요)</span>
            </div>
            <div class="rate-position">
              <span class="rate-position__pct">${costRatePct}%</span>
              <div class="rate-position__track">
                <span class="rate-position__fill" style="width:${Math.min(costRatePct, 100)}%"></span>
              </div>
            </div>
          </div>
          <div class="villain-card">
            <span class="villain-card__emoji">${villain.emoji}</span>
            <div class="villain-card__body">
              <strong class="villain-card__title">${villain.title}</strong>
              <span class="villain-card__desc">${villain.desc}</span>
            </div>
            <button type="button" class="villain-card__info" aria-label="빌런 등급표 보기">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 10v6M12 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </details>
    </div>
  `;

  const villainInfoBtn = detailRoot.querySelector(".villain-card__info");
  if (villainInfoBtn) {
    villainInfoBtn.addEventListener("click", () => openVillainGradeModal(villain.id));
  }
}

function openVillainGradeModal(activeGradeId) {
  const modal = document.getElementById("villain-modal");
  const list = document.getElementById("villain-modal-list");
  if (!modal || !list) return;

  list.innerHTML = getVillainGrades()
    .map(
      (grade) => `
      <li class="villain-grade-item${grade.id === activeGradeId ? " villain-grade-item--active" : ""}">
        <span class="villain-grade-item__emoji">${grade.emoji}</span>
        <div class="villain-grade-item__body">
          <div class="villain-grade-item__head">
            <strong class="villain-grade-item__title">${grade.title}</strong>
            <span class="villain-grade-item__range">${grade.range}</span>
          </div>
          <p class="villain-grade-item__desc">${grade.desc}</p>
        </div>
      </li>
    `
    )
    .join("");

  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".villain-modal__close")?.focus();
}

function closeVillainGradeModal() {
  const modal = document.getElementById("villain-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function initVillainGradeModal() {
  const modal = document.getElementById("villain-modal");
  if (!modal) return;

  modal.querySelector(".villain-modal__backdrop")?.addEventListener("click", closeVillainGradeModal);
  modal.querySelector(".villain-modal__close")?.addEventListener("click", closeVillainGradeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeVillainGradeModal();
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

bindNavButtons();
renderHome();
initReportForm();
initVillainGradeModal();
