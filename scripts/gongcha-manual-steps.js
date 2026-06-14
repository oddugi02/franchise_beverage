// 공차 Quizlet 레시피 store/home 단계 — gongcha-quizlet-recipes.js에서 재export
const { GONGCHA_QUIZLET_RECIPES } = require("./gongcha-quizlet-recipes");

module.exports = Object.fromEntries(
  GONGCHA_QUIZLET_RECIPES.map(({ slug, store, home, topping }) => [
    slug,
    { store, home, ...(topping ? { topping } : {}) },
  ]),
);
