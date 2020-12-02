
const router = require("../../lib/router"); //router
const login = require("../../controllers/public/login");

router.get("/login", login.logView).get("/access", login.logView).get("/acceso", login.logView);
router.post("/login", login.login).post("/access", login.login).post("/acceso", login.login);
router.get("/logout", login.logout).get("/exit", login.logout).get("/salir", login.logout);
router.get("/admin", login.admin);

module.exports = login;
