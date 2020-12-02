
const router = require("../../lib/router"); //router
const pass = require("../../controllers/user/pass");

router.get("/clave", pass.passView);
router.get("/pass", pass.passView);
router.get("/password", pass.passView);

router.post("/clave", pass.password);
router.post("/pass", pass.password);
router.post("/password", pass.password);

module.exports = pass;
