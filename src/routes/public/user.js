
const router = require("../../lib/router"); //router
const user = require("../../controllers/public/user");

router.get("/usuario", user.usuarioView);
router.get("/user", user.usuarioView);

router.post("/usuario", user.usuario);
router.post("/user", user.usuario);

module.exports = user;
