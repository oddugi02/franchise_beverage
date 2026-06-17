const { filterCheaperAtHome } = require("./filter-cheaper-at-home");
const { partitionByPhoto } = require("./filter-with-photo");

function applyMenuFilters(menus, label = "") {
  const afterPrice = filterCheaperAtHome(menus);
  const { dropped: noPhoto } = partitionByPhoto(afterPrice);
  if (noPhoto.length) {
    const prefix = label ? ` · ${label}` : "";
    console.log(`No photo (${noPhoto.length}) — hidden from list${prefix}:`);
    noPhoto.forEach((m) => console.log(`  - ${m.id} (${m.name})`));
  }
  const noPhotoIds = new Set(noPhoto.map((m) => m.id));
  return afterPrice.map((menu) => ({
    ...menu,
    listHidden: noPhotoIds.has(menu.id),
  }));
}

module.exports = { applyMenuFilters };
