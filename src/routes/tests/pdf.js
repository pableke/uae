
const router = require("../../lib/router"); //router
const test = require("../../controllers/tests/pdf");


router.get("/test/pdf", test.pdf);

module.exports = test;
