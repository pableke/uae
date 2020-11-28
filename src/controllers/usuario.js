
//const mailer = require("../lib/mailer"); //validators
//const fetch = require("node-fetch"); //HTTP calls
const valid = require("validate-box"); //validators
const dao = require("../dao/Factory"); //bd connection
const index = require("./index"); //bd connection

function fnPerfilView(req, res) {
	res.set("tplSection", "dist/forms/usuario/perfil.html")
		.set("steps", [{ pref: "perfil.html", text: res.data.lblFormLogin }])
		.render();
}
exports.perfilView = function(req, res) {
	if (!req.logged() || req.expired())
		return index.error(req, res);
	res.flush("nombreErrText").flush("ap1ErrText").flush("ap2ErrText").flush("nifErrText").flush("correoErrText");
	fnPerfilView(req, res);
}
exports.perfil = function(req, res) {
	if (!req.logged() || req.expired())
		return index.error(req, res);

	let fields = req.body; //request fields
	valid.init().size(fields.nombre, 1, 200) || valid.setError("nombre", res.get("errNombre")); //same error for name and surname
	valid.size(fields.ap1, 1, 200) || valid.setError("ap1", res.get("errNombre")); //same error for name and surname
	valid.size(fields.ap2, 0, 200) || valid.setError("ap2", res.get("errNombre")); //same error for name and surname
	(valid.size(fields.nif, 1, 50) && valid.esId(fields.nif)) || valid.setError("nif", res.get("errNif"));
	(valid.size(fields.correo, 1, 200) && valid.email(fields.correo)) || valid.setError("correo", res.get("errCorreo"));
	if (valid.isError()) //fields error?
		return res.jerr(valid.getErrors());

	fields._id = res.get("_idUserSession");
	dao.myjson.usuarios.updateById(fields).then(users => {
		let name = (fields.nombre + " " + fields.ap1 + " " + fields.ap2).trim();
		res.addBySuffix(fields, "UserSession").set("fullNameUserSession", name);
		res.text(res.get("msgUpdateOk"));
	})
	.catch(err => {
		res.jerr(valid.endErrors(res.get("errUpdate")));
	});
}

function fnPassView(req, res) {
	res.set("tplSection", "dist/forms/usuario/pass.html")
		.set("steps", [{ pref: "pass.html", text: res.data.lblFormLogin }])
		.render();
}
exports.passView = function(req, res) {
	return (!req.logged() || req.expired()) ? index.error(req, res) 
											: fnPassView(req, res.flush("oldPassErrText").flush("newPassErrText").flush("rePassErrText"));
}
exports.password = function(req, res) {
	if (!req.logged() || req.expired())
		return index.error(req, res);

	let fields = req.body; //request fields
	(valid.size(fields.oldPass, 8, 200) && valid.login(fields.oldPass)) ? res.flush("oldPassErrText") : !res.copy("oldPassErrText", "errClave");
	ok = (valid.size(fields.newPass, 8, 200) && valid.login(fields.newPass)) ? (res.flush("newPassErrText") && ok) : !res.copy("newPassErrText", "errClave");
	ok = (fields.newPass == fields.rePass) ? (res.flush("rePassErrText") && ok) : !res.copy("rePassErrText", "errReClave");
	if (!ok) //fields error?
		return fnPassView(req, res.i18nError("errUpdate"));

	//dao.mysql.usuarios.updateNewPass(res.get("idUserSession"), fields.oldPass, fields.newPass).then(result => {
	dao.myjson.usuarios.updateNewPass(res.get("idUserSession"), fields.oldPass, fields.newPass).then(result => {
		//if (result.changedRows == 1)
			index.admin(req, res.i18nOk("msgChangePassOk"));
		//else
			//fnPassView(req, res.get("errUpdate")); //stop resolves and call catch
	})
	.catch(err => {
		fnPassView(req, res.i18nError("errUpdate"));
	});
}

exports.insert = function(req, res) {
}

exports.update = function(req, res) {
}

exports.delete = function(req, res) {
}
