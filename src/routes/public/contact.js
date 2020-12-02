
const router = require("../../lib/router"); //router
const contact = require("../../controllers/public/contact");

router.get("/contact", contact.contactView);
router.get("/contacto", contact.contactView);

router.post("/contact", contact.contact);
router.post("/contacto", contact.contact);

module.exports = contact;
