
const router = require("../lib/router"); //router
const error = require("../controllers/error");

//definicion de rutas del modulo index
router.get("/error404", error.err404);
//----------------------------------------------

module.exports = error;
