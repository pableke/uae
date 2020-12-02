
const router = require("../lib/router"); //router

exports.error = require("./errors/error");
exports.public = require("./public/routes");
exports.index = require("./sections/index");
exports.user = require("./user/routes");

exports.test = require("./test");
exports.wp = require("./webpush");

exports.find = router.find;
exports.search = router.search;
