
const router = require("../../lib/router"); //router
const wp = require("../../controllers/tests/webpush");

router.get("/web-push", wp.webpush);
router.get("/webpush", wp.webpush);

router.post("/subscription", wp.subscription);
router.post("/new-message", wp.newMessage);

module.exports = wp;
