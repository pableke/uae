
const router = require("../../lib/router"); //router
const reactive = require("../../controllers/public/reactive");

router.get("/reactive", reactive.reactiveView);
router.get("/reactivar", reactive.reactiveView);

router.post("/reactive", reactive.reactive);
router.post("/reactivar", reactive.reactive);

module.exports = reactive;
