
const dao = require("../../dao/Factory"); //bd connection
const mailer = require("../../lib/mailer");
const sv = require("../../services/validator");
const vb = require("validate-box");

function fnUsuario(req, res) {
	res.set("tplSection", "dist/forms/public/user.html").set("steps", [{ pref: "/user.html", text: res.data.lblFormRegistro }]).render();
}

exports.usuarioView = function(req, res) {
	fnUsuario(req, res.flush("nombreErrText").flush("apellido1ErrText").flush("apellido2ErrText").flush("nifErrText").flush("emailErrText"));
}

exports.usuario = function(req, res) {
	let fields = req.body; //request fields
	if (!sv.user(fields) || !sv.captcha(fields.token)) //fields error?
		return res.jerr(sv.getErrors());

	//https://www.google.com/recaptcha/intro/v3.html
	let pass = vb.generatePassword(); //build a new secure password
	const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_PRIVATE}&response=` + fields.token;
	fetch(url, { method: "post" })
		.then(res => res.json())
		.then(gresponse => {
			if (gresponse.success && (gresponse.score > 0.5))
				//return dao.mysql.usuarios.insert(fields.nif, fields.nombre, fields.apellido1, fields.apellido2, fields.email, pass, 0, res.get("sysdate"));
				return dao.myjson.usuarios.insertData(fields.nif, fields.nombre, fields.apellido1, fields.apellido2, fields.email, pass, 0, res.get("sysdate"));
			else
				throw sv.close("errCaptcha"); //stop resolves and call catch
		})
		.then(result => {
			//if ((result.affectedRows == 1) && (result.insertId > 0)) {
				res.set("tplSection", "dist/mails/user.html").set("pass", pass);
				let html = res.build("dist/mails/index.html").getValue();
				return mailer.send(fields.email, "Email de alta", html);
			//}
			//else
				//throw sv.close("errAlta"); //stop resolves and call catch
		})
		.then(info => { res.text(res.get("msgUsuario")); })
		//res.error((err.errno == 1062) ? res.get("errUsuarioUk") : err.message);
		.catch(err => { res.jerr(sv.close(err.message)); });
}
