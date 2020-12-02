
const dao = require("../../dao/Factory"); //bd connection
const sv = require("../../lib/validator");
const login = require("../public/login");

function fnPerfilView(req, res) {
	res.set("tplSection", "dist/forms/user/perfil.html")
		.set("steps", [{ pref: "/perfil.html", text: res.data.lblFormPerfil }])
		.render();
}

exports.perfilView = function(req, res) {
	if (!login.isLogged(req, res))
		return login.logError(req, res);

	res.flush("nombreErrText").flush("ap1ErrText").flush("ap2ErrText").flush("nifErrText").flush("correoErrText");
	fnPerfilView(req, res);
}

exports.perfil = function(req, res) {
	if (!login.isLogged(req, res))
		return login.logError(req, res);

	let fields = req.body; //request fields
	if (!sv.user(fields)) //fields error?
		return res.jerr(sv.getErrors());

	fields._id = res.get("_idUserSession");
	dao.myjson.usuarios.updateById(fields).then(users => {
		let name = (fields.nombre + " " + fields.ap1 + " " + fields.ap2).trim();
		res.addSuffix(fields, "UserSession").set("fullNameUserSession", name);
		res.text(res.get("msgUpdateOk"));
	}).catch(err => {
		res.jerr(sv.close("errUpdate"));
	});
}
