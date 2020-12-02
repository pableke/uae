
const router = require("../../lib/router"); //router
const error = require("../../controllers/errors/error");

router.get("/error404", error.err404);

module.exports = error;
