
/**
 * Validator Service
 * @module Validator
 */

const valid = require("validate-box"); //validators
const { mb, nb } = valid; //declare message-box and number-box modules

/** 
 * A User
 * @typedef {Object} User
 * @property {number} _id User Id
 * @property {string} nombre User Name
 * @property {string} ap1 User Surname
 * @property {string} [ap2] User Surname (optional)
 * @property {string} nif NIF Id
 * @property {string} correo User email
 */

function fnEmail(value) {
	if (!valid.size(value, 1, 200))
		return !mb.i18nError("correo", "errRequired");
	if (!valid.email(value))
		return !mb.i18nError("correo", "errCorreo");
	return true;
}

/**
 * Initialize message-box and validate email only
 *
 * @function email
 * @param      {string}  correo  The user email
 * @return     {boolean}  True if all fields are valids or false otherwise
 */
exports.email = function(correo) {
	mb.init(); //starts validation
	return fnEmail(correo);
}

/**
 * New / update user validator (know more in {@link User})
 *
 * @function user
 * @param      {User}  fields  The object containing all user data
 * @return     {boolean}  True if all fields are valids or false otherwise
 */
exports.user = function(fields) {
	mb.init(); //starts validation
	valid.size(fields.nombre, 1, 200) || mb.i18nError("nombre", "errNombre");
	valid.size(fields.ap1, 1, 200) || mb.i18nError("ap1", "errNombre");
	valid.size(fields.ap2, 0, 200) || mb.i18nError("ap2", "errNombre");
	(valid.size(fields.nif, 1, 50) && valid.esId(fields.nif)) || mb.i18nError("nif", "errNif");
	return fnEmail(fields.correo) && mb.isOk();
}

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

function fnLogin(name, value, msg) {
	if (!valid.size(value, 8, 200))
		return !mb.i18nError(name, "errRequired");
	if (!valid.login(value))
		return !mb.i18nError(name, msg);
	return true;
}

/**
 * User update password validator
 *
 * @function password
 * @param      {string}  oldPass  Previous user password
 * @param      {string}  newPass  The new user password
 * @param      {string}  rePass   Verifi new user password
 * @return     {boolean}  True if passwords fields are valid or false otherwise
 */
exports.password = function(oldPass, newPass, rePass) {
	mb.init(); //starts validation
	(newPass == rePass) || mb.i18nError("rePass", "errReClave");
	return fnLogin("oldPass", oldPass, "errClave") && fnLogin("newPass", newPass, "errClave") && mb.isOk();
}

/**
 * Login validator
 *
 * @function login
 * @param      {string}  log     The user login
 * @param      {string}  pass    The pass
 * @return     {boolean}  True if login and password fields are valids or false otherwise
 */
exports.login = function(log, pass) {
	mb.init(); //starts validation
	return fnLogin("usuario", log, "errUsuario") && fnLogin("clave", pass, "errClave");
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

/**
 * Product fields validator
 *
 * @function product
 * @param      {string}  name    The name asociated
 * @param      {number}  price   The price of the product
 * @param      {string}  info    Long information / description asociated to product
 * @return     {boolean}  True if all fields are valids or false otherwise
 */
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
