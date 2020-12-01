
const dao = require("../../dao/Factory"); //bd connection
const mailer = require("../../lib/mailer");
const valid = require("../../services/validator");

function fnReactive(req, res) {
	res.set("tplSection", "dist/forms/public/reactive.html").set("steps", [{ pref: "reactive.html", text: res.data.lblReactivar }]).render();
}
exports.reactiveView = function(req, res) {
	fnReactive(req, res.flush("correoErrText"));
}
exports.reactive = function(req, res) {
	let fields = req.body; //request fields
	if (!valid.email(fields.email) || !valid.captcha(fields.token)) //fields error?
		return res.jerr(valid.getErrors());

	//https://www.google.com/recaptcha/intro/v3.html
	let pass = valid.generatePassword(); //build a new secure password
	const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_PRIVATE}&response=` + fields.token;
	fetch(url, { method: "post" })
		.then(res => res.json())
		.then(gresponse => {
			if (gresponse.success && (gresponse.score > 0.5))
				//return dao.mysql.usuarios.updatePassByMail(fields.email, pass);
				return dao.myjson.usuarios.updatePassByMail(fields.email, pass);
			else
				throw valid.close("errCaptcha"); //stop resolves and call catch
		})
		.then(result => {
			//if (result.changedRows == 1) {
				res.set("tplSection", "dist/mails/reactive.html").set("pass", pass);
				let html = res.build("dist/mails/index.html").getValue();
				return mailer.send(fields.email, "Email de reactivación", html);
			//}
			//else
				//throw valid.setMessage(res.get("errUpdate")).getError(); //stop resolves and call catch
		})
		.then(info => { res.text(res.get("msgReactive")); })
		.catch(err => { res.jerr(valid.close(err.message)); });
}
