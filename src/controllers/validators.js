
/**
 * Controllers Validator Service
 * @module Validator
 */

const valid = require("validate-box"); //validators
const { mb } = valid; //declare message-box and number-box modules

/**
 * Determine if the request is logged in session or if it is logged but has expired.
 * And set specific message error for each case.
 *
 * @function isLogged
 * @param      {Request}  req     The request object
 * @param      {Response} res     The resource object
 * @return     {boolean}  True if session is alive, False otherwise
 */
exports.isLogged = function(req, res) {
    if (!req.logged())
    	return !res.copy("msgError", "err401");
    if (req.expired())
    	return !res.copy("msgError", "errEndSession");
	return true;
}

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

function fnLogin(name, value, msg) {
	if (!valid.size(value, 8, 200))
		return !mb.i18nError(name, "errRequired");
	if (!valid.login(value))
		return !mb.i18nError(name, msg);
	return true;
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

exports.getErrors = mb.getErrors;
exports.close = mb.close;
