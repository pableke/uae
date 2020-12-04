
const valid = require("validate-box"); //validators
const { mb, nb } = valid;

function fnEmail(value) {
	if (!valid.size(value, 1, 200))
		return !mb.i18nError("correo", "errRequired");
	if (!valid.email(value))
		return !mb.i18nError("correo", "errCorreo");
	return true;
}

exports.email = function(correo) {
	mb.init(); //starts validation
	return fnEmail(correo);
}

exports.user = function(fields) {
	mb.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || mb.i18nError("nombre", "errNombre");
	valid.size(fields.ap1, 1, 200) || mb.i18nError("ap1", "errNombre");
	valid.size(fields.ap2, 0, 200) || mb.i18nError("ap2", "errNombre");
	(valid.size(fields.nif, 1, 50) && valid.esId(fields.nif)) || mb.i18nError("nif", "errNif");
	return fnEmail(fields.correo) && mb.isOk();
}

exports.captcha = function(token) {
	if (valid.size(token, 100, 600))
		return true;
	return !mb.i18nMessage("errCaptcha");
}

function fnLogin(name, value, msg) {
	if (!valid.size(value, 8, 200))
		return !mb.i18nError(name, "errRequired");
	if (!valid.login(value))
		return !mb.i18nError(name, msg);
	return true;
}

exports.password = function(oldPass, newPass, rePass) {
	mb.init(); //starts validation
	(newPass == rePass) || mb.i18nError("rePass", "errReClave");
	return fnLogin("oldPass", oldPass, "errClave") && fnLogin("newPass", newPass, "errClave") && mb.isOk();
}

exports.login = function(log, pass) {
	mb.init(); //starts validation
	return fnLogin("usuario", log, "errUsuario") && fnLogin("clave", pass, "errClave");
}

exports.contact = function(fields) {
	mb.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || mb.i18nError("nombre", "errNombre");
	valid.size(fields.asunto, 1, 200) || mb.i18nError("asunto", "errAsunto");
	valid.size(fields.info, 1, 600) || mb.i18nError("info", "errAsunto");
	return fnEmail(fields.correo) && mb.isOk();
}

exports.product = function(name, price, info) {
	mb.init(); //starts validation
	nb.gt0(price) || mb.i18nError("price", "errImporte0"); //validate float value
	valid.size(name, 1, 200) || mb.i18nError("name", "errRequired");
	valid.size(info, 1, 400) || mb.i18nError("info", "errRequired");
	return mb.isOk();
}

exports.generatePassword = valid.generatePassword;
exports.getErrors = mb.getErrors;
exports.close = mb.close;
