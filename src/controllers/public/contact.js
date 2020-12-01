
const mailer = require("../../lib/mailer");
const valid = require("../../services/validator");

function fnContact(req, res) {
	let sysdate = valid.dt.isoDate(res.get("sysdate"));
	res.set("tplSection", "dist/forms/public/contact.html").set("ejDate", sysdate)
		.set("steps", [{ pref: "contact.html", text: res.data.lblFormContact }]).render();
}

exports.contactView = function(req, res) {
	res.flush("nombreVal").flush("nombreErrText").flush("correoVal").flush("correoErrText")
		.flush("asuntoVal").flush("asuntoErrText").flush("infoVal").flush("infoErrText");
	fnContact(req, res);
}

exports.contact = function(req, res) {
	let fields = req.body; //request fields
	if (valid.contact(fields)) //fields error?
		return res.jerr(valid.getErrors());

	res.set("tplSection", "dist/mails/contact.html");
	let html = res.build("dist/mails/index.html").getValue();
	mailer.send("pablo.rosique@upct.es", "Email de contacto", html)
		.then(info => { res.text(res.get("msgCorreo")); })
		.catch(err => { res.jerr(valid.getErrors()); });
}
