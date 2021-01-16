
/**
 * Public Validator Service
 * @module Validator
 */

const valid = require("validate-box"); //validators
const sv = require("../validators");

//declare message-box and number-box modules
const { dt, mb, nb } = valid;

exports.user = sv.user;
exports.email = sv.email;
exports.login = sv.login;
exports.isLogged = sv.isLogged;

/**
 * Not to initialize message-box and validate captcha only
 *
 * @function captcha
 * @param      {string}  correo  The captcha token
 * @return     {boolean}  True if all fields are valids or false otherwise
 */
exports.captcha = function(token) {
	if (valid.size(token, 100, 800))
		return true;
	return !mb.i18nMessage("errCaptcha");
}

/**
 * Contact fields validator
 *
 * @function contact
 * @param      {Object}  fields  The object containing contact data
 * @return     {boolean}  True if all fields are valids or false otherwise
 */
exports.contact = function(fields) {
	mb.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || mb.i18nError("nombre", "errNombre");
	valid.size(fields.asunto, 1, 200) || mb.i18nError("asunto", "errAsunto");
	valid.size(fields.info, 1, 600) || mb.i18nError("info", "errAsunto");
	return fnEmail(fields.correo) && mb.isOk();
}

exports.isoDate = dt.isoDate;

exports.generatePassword = valid.generatePassword;
exports.getErrors = mb.getErrors;
exports.close = mb.close;
