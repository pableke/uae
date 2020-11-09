
const router = require("../lib/router"); //router
const usuario = require("../controllers/usuario");

//definicion de rutas del modulo usuario
router.get("/perfil", usuario.perfilView);
router.post("/perfil", usuario.perfil);

router.get("/clave", usuario.passView);
router.get("/pass", usuario.passView);
router.get("/password", usuario.passView);
router.post("/pass", usuario.password);
//----------------------------------------------

module.exports = usuario;
