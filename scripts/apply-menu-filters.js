const { filterCheaperAtHome } = require("./filter-cheaper-at-home");
const { partitionByPhoto } = require("./filter-with-photo");

function applyMenuFilters(menus, label = "") {
  const afterPrice = filterCheaperAtHome(menus);
  const { dropped: noPhoto } = partitionByPhoto(afterPrice);
  if (noPhoto.length) {
    const prefix = label ? ` · ${label}` : "";
    console.log(`No photo yet (${noPhoto.length}) — still listed${prefix}:`);
    noPhoto.forEach((m) => console.log(`  - ${m.id} (${m.name})`));
  }
  return afterPrice;
}

module.exports = { applyMenuFilters };
