
const valid = require("validate-box"); //validators

function fnEmail(value) {
	if (!valid.size(value, 1, 200))
		return !valid.i18nError("correo", "errRequired");
	if (!valid.email(value))
		return !valid.i18nError("correo", "errCorreo");
	return true;
}

exports.email = function(correo) {
	valid.init(); //starts validation
	return fnEmail(correo);
}

exports.user = function(fields) {
	valid.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || valid.i18nError("nombre", "errNombre");
	valid.size(fields.ap1, 1, 200) || valid.i18nError("ap1", "errNombre");
	valid.size(fields.ap2, 0, 200) || valid.i18nError("ap2", "errNombre");
	(valid.size(fields.nif, 1, 50) && valid.esId(fields.nif)) || valid.i18nError("nif", "errNif");
	return fnEmail(fields.correo) && valid.isOk();
}

exports.captcha = function(token) {
	if (valid.size(token, 100, 600))
		return true;
	return !valid.setMsgI18n("errCaptcha");
}

function fnLogin(name, value, msg) {
	if (!valid.size(value, 8, 200))
		return !valid.i18nError(name, "errRequired");
	if (!valid.login(value))
		return !valid.i18nError(name, msg);
	return true;
}

exports.password = function(oldPass, newPass, rePass) {
	valid.init(); //starts validation
	(fields.newPass == fields.rePass) || valid.i18nError("rePass", "errReClave");
	return fnLogin("oldPass", oldPass, "errClave") && fnLogin("newPass", newPass, "errClave") && valid.isOk();
}

exports.login = function(log, pass) {
	valid.init(); //starts validation
	return fnLogin("usuario", log, "errUsuario") && fnLogin("clave", pass, "errClave");
}

exports.contact = function(fields) {
	valid.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || valid.i18nError("nombre", "errNombre");
	valid.size(fields.asunto, 1, 200) || valid.i18nError("asunto", "errAsunto");
	valid.size(fields.info, 1, 600) || valid.i18nError("info", "errAsunto");
	return fnEmail(fields.correo) && valid.isOk();
}

exports.product = function(name, price, info) {
	valid.init(); //starts validation
	valid.nb.gt0(price) || valid.setError("price", "El importe debe ser mayor de " + valid.nb.float(0) + " &euro;"); //validate float value
	valid.size(name, 1, 200) || valid.setError("name", "Nonmbre del producto no válido");
	valid.size(info, 1, 400) || valid.setError("info", "La descripción asociada no es válida");
	return valid.isOk();
}

exports.getErrors = valid.getErrors;
exports.close = valid.close;
