
const router = require("../lib/router"); //router
const test = require("../controllers/test");

//definicion de rutas del modulo test
router.get("/test/zip", test.zip);
router.get("/test/pdf", test.pdf);
router.get("/usuarios", test.usuarios);
//----------------------------------------------

module.exports = test;
