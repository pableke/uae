
const router = require("../lib/router"); //router
const index = require("../controllers/index");

//definicion de rutas del modulo index
router.get("/", index.inicio).get("/inicio", index.inicio).get("/index", index.inicio).get("/home", index.inicio);
router.get("/section", index.section).get("/sections", index.section).get("/seccion", index.section).get("/secciones", index.section);
router.get("/trabajando", index.trabajando).get("/working", index.trabajando);
router.get("/lang", index.lang).get("/language", index.lang);

router.get("/login", index.logView).get("/access", index.logView).get("/acceso", index.logView);
router.post("/login", index.login).post("/access", index.login).post("/acceso", index.login);
router.get("/logout", index.logout).get("/exit", index.logout).get("/salir", index.logout);
router.get("/admin", index.admin);

router.get("/contact", index.contactView);
router.get("/contacto", index.contactView);
router.post("/contact", index.contact);

router.get("/reactive", index.reactiveView);
router.get("/reactivar", index.reactiveView);
router.post("/reactive", index.reactive);

router.get("/usuario", index.usuarioView);
router.get("/user", index.usuarioView);
router.post("/usuario", index.usuario);
//----------------------------------------------

module.exports = index;
