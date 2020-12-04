
const router = require("../../lib/router"); //router
const test = require("../../controllers/tests/zip");

router.get("/test/zip", test.zip);
router.get("/usuarios", test.usuarios);

module.exports = test;
