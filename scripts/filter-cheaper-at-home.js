/** 집 1회 분량 가격이 매장가 이상인 메뉴 제외 */
function getMenuHomePrice(menu) {
  const items = menu.recipe?.homeIngredients || [];
  return items.reduce((sum, item) => {
    if (typeof item === "string") return sum;
    if (item.label === "얼음") return sum;
    return sum + (item.price ?? item.cost ?? 0);
  }, 0);
}

function isCheaperAtHome(menu) {
  if (!menu.recipeReady || !menu.price) return true;
  const home = getMenuHomePrice(menu);
  if (!home) return true;
  return home < menu.price;
}

function filterCheaperAtHome(menus) {
  return menus.filter(isCheaperAtHome);
}

module.exports = { getMenuHomePrice, isCheaperAtHome, filterCheaperAtHome };
