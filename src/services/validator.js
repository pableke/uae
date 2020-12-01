
const valid = require("validate-box"); //validators

function fnEmail(correo) {
	if (valid.size(correo, 1, 200) && valid.email(correo))
		return true;
	return !valid.i18nError("correo", "errCorreo");
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
	return !valid.setMsgI18n("errCaptcha")
}

exports.password = function(oldPass, newPass, rePass) {
	valid.init(); //starts validation
	(valid.size(oldPass, 8, 200) && valid.login(oldPass)) || valid.i18nError("oldPass", "errClave");
	(valid.size(newPass, 8, 200) && valid.login(newPass)) || valid.i18nError("newPass", "errClave");
	(fields.newPass == fields.rePass) || valid.i18nError("rePass", "errReClave");
	return valid.isOk();
}

exports.login = function(log, pass) {
	valid.init(); //starts validation
	(valid.size(log, 8, 200) && valid.login(log)) || valid.i18nError("usuario", "errUsuario");
	(valid.size(pass, 8, 200) && valid.login(pass)) || valid.i18nError("clave", "errClave");
	return valid.isOk();
}

exports.contact = function(fields) {
	valid.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || valid.i18nError("nombre", "errNombre");
	valid.size(fields.asunto, 1, 200) || valid.i18nError("asunto", "errAsunto");
	valid.size(fields.info, 1, 600) || valid.i18nError("info", "errAsunto");
	return fnEmail(fields.correo) && valid.isOk();
}

exports.generatePassword = valid.generatePassword;
exports.getErrors = valid.getErrors;
exports.close = valid.close;
