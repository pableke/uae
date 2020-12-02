
const router = require("../../lib/router"); //router
const index = require("../../controllers/sections/index");

router.get("/", index.inicio).get("/inicio", index.inicio).get("/index", index.inicio).get("/home", index.inicio);
router.get("/section", index.section).get("/sections", index.section).get("/seccion", index.section).get("/secciones", index.section);
router.get("/trabajando", index.trabajando).get("/working", index.trabajando);
router.get("/lang", index.lang).get("/language", index.lang);

module.exports = index;
