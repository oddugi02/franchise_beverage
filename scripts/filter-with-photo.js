const fs = require("fs");
const path = require("path");

const BRAND_ID = {
  "메가커피": "mega",
  공차: "gongcha",
  빽다방: "paik",
  이디야: "ediya",
  파스쿠찌: "pascucci",
  "매머드 커피": "mammoth",
  스타벅스: "starbucks",
  컴포즈커피: "compose",
};

function getMenuPhotoPath(menu, rootDir = path.join(__dirname, "..")) {
  if (menu.photoUrl) {
    return path.join(rootDir, menu.photoUrl.replace(/^\//, ""));
  }
  const brandId = BRAND_ID[menu.brand];
  if (!brandId || !menu.id) return null;
  return path.join(rootDir, "assets/menus", brandId, `${menu.id}.jpg`);
}

function hasMenuPhoto(menu) {
  const p = getMenuPhotoPath(menu);
  return Boolean(p && fs.existsSync(p));
}

function filterWithPhoto(menus) {
  return menus.filter(hasMenuPhoto);
}

function partitionByPhoto(menus) {
  const kept = [];
  const dropped = [];
  for (const menu of menus) {
    (hasMenuPhoto(menu) ? kept : dropped).push(menu);
  }
  return { kept, dropped };
}

module.exports = { BRAND_ID, getMenuPhotoPath, hasMenuPhoto, filterWithPhoto, partitionByPhoto };
