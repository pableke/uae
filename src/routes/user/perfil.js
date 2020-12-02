
const router = require("../../lib/router"); //router
const perfil = require("../../controllers/user/perfil");

router.get("/perfil", perfil.perfilView);
router.post("/perfil", perfil.perfil);

module.exports = perfil;
