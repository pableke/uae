
//const mailer = require("../lib/mailer"); //validators
//const fetch = require("node-fetch"); //HTTP calls
const valid = require("validate-box"); //validators
const dao = require("../dao/Factory"); //bd connection
const index = require("./index"); //bd connection

function fnError(msg, code, num) {
	return { errno: num || -1, code: code, message: msg };
}

function fnPerfilView(req, res) {
	res.set("tplSection", "dist/forms/usuario/perfil.html")
		.set("steps", [{ pref: "perfil.html", text: res.data.lblFormLogin }])
		.render();
}
exports.perfilView = function(req, res) {
	if (!req.logged() || req.expired())
		return index.logView(req, res.i18nError("err401"));
	res.flush("nombreErrText").flush("apellido1ErrText").flush("apellido2ErrText").flush("nifErrText").flush("emailErrText");
	fnPerfilView(req, res);
}
exports.perfil = function(req, res) {
	if (!req.logged() || req.expired())
		return index.logView(req, res.i18nError("err401"));
	fnPerfilView(req, res);
}

function fnPassView(req, res) {
	res.set("tplSection", "dist/forms/usuario/pass.html")
		.set("steps", [{ pref: "pass.html", text: res.data.lblFormLogin }])
		.render();
}
exports.passView = function(req, res) {
	if (!req.logged() || req.expired())
		return index.logView(req, res.ib18nError("err401"));
	fnPassView(req, res.flush("oldPassErrText").flush("newPassErrText").flush("rePassErrText"));
}
exports.password = function(req, res) {
	if (!req.logged() || req.expired())
		return index.logView(req, res.i18nError("err401"));

	let fields = req.body; //request fields
	let ok = (valid.size(fields.oldPass, 8, 200) && valid.login(fields.oldPass)) ? res.flush("oldPassErrText") : !res.copy("oldPassErrText", "errClave");
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
