/** 제조 매뉴얼 steps에 있는 slug만 노출 */
function slugFromId(id, prefix) {
  return id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

function filterManualMenus(menus, prefix, manual, allowedSlugs) {
  const allow = allowedSlugs ? new Set(allowedSlugs) : null;
  return menus.filter((m) => {
    const slug = slugFromId(m.id, prefix);
    if (allow && !allow.has(slug)) return false;
    return Boolean(manual[slug]);
  });
}

module.exports = { filterManualMenus, slugFromId };
