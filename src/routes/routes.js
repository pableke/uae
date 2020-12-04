
const router = require("../lib/router"); //router

// Exports specific routes for each module
exports.error = require("./errors/error");
exports.public = require("./public/routes");
exports.index = require("./sections/index");
exports.user = require("./user/routes");
exports.test = require("./tests/routes");

// Exports routering search function
exports.search = router.search;
