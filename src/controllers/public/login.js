
/**
 * Login controller
 * @module Login
 */

const bcrypt = require("bcrypt"); //encrypt
const dao = require("../../dao/Factory"); //bd connection
const sv = require("../../lib/validator");

function fnLogin(req, res) {
	res.set("tplSection", "dist/forms/public/login.html")
		.set("steps", [{ pref: "/login.html", text: res.data.lblFormLogin }])
		.render();
}

function fnLogError(req, res) {
	fnLogin(req, res.i18nError("errLogin"));
}

function fnLogView(req, res) {
	fnLogin(req, res.flush("usuarioValue").flush("usuarioErrText").flush("claveErrText"));
}

exports.logView = fnLogView;

function fnLogClear(req, res) {
	req.closeSession(); //clear session data
	//dao.mysql.menus.findPublic().then(...);
	res.set("menus", dao.myjson.menus.findPublic()).flush("startSession");
}

/**
 * Determine if the request is logged in session or if it is logged but has expired.
 * And set specific message error for each case.
 *
 * @function isLogged
 * @param      {Request}  req     The request object
 * @param      {Response} res     The resource object
 * @return     {boolean}  True if session is alive, False otherwise
 */
function fnLogged(req, res) {
    if (!req.logged())
    	return !res.i18nError("err401");
    if (req.expired())
    	return !res.i18nError("errEndSession");
	return true;
}
exports.isLogged = fnLogged;

/**
 * Remove session and restore public menus, then check if request is ajax and response a JSON object with the message contained in "msgError" text, 
 * but if the request is non ajax, it redirect response to login form with the specified "msgError" text.
 *
 * @function logError
 * @param      {Request}  req     The request object
 * @param      {Response} res     The resource object
 */
exports.logError = function(req, res) {
	fnLogClear(req, res);
	if (req.isAjax)
		res.jerr(sv.close("msgError"));
	else
		fnLogView(req, res);
}

/**
 * Remove session, restore public menus and redirect response to login form with the specific message.
 *
 * @function logout
 * @param      {Request}  req     The request object
 * @param      {Response} res     The resource object
 */
 function fnLogout(req, res) {
	fnLogClear(req, res);
	fnLogView(req, res);
}
exports.logout = function(req, res) {
	fnLogout(req, res.i18nOk("msgLogout"));
};

function fnAdmin(req, res) {
    if (!fnLogged(req, res))
		return fnLogout(req, res);
	res.set("tplSection", "dist/sections/admin.html")
		.set("steps", [{ pref: "/admin.html", text: res.data.lblAdmin }])
		.render();
}
exports.admin = fnAdmin;

exports.login = function(req, res) {
	let fields = req.body; //request fields
	if (!sv.login(fields.usuario, fields.clave)) //fields error?
		return fnLogError(req, res.addSuffix(sv.getErrors(), "ErrText"));

	let user = dao.myjson.usuarios.findByLogin(fields.usuario);
	if (!user)
		return fnLogError(req, res.copy("usuarioErrText", "errUsuario"));

	res.set("usuarioValue", fields.usuario);
	if (bcrypt.compareSync(fields.clave, user.clave)) {
		let name = (user.nombre + " " + user.ap1 + " " + user.ap2).trim();
		res.addSuffix(user, "UserSession").set("fullNameUserSession", name);
		let fn = req.startSession().getSessionHelper() || fnAdmin; //exists helper?
		fn(req, res.set("menus", dao.myjson.menus.findByUser(user._id)).i18nOk("msgLogin")); //update user menu
	}
	else
		fnLogError(req, res.copy("claveErrText", "errClave"));

	/*dao.mysql.usuarios.findByLogin(fields.usuario, fields.clave).then(user => {
		let name = (user.nombre + " " + user.ap1 + " " + user.ap2).trim();
		res.addSuffix(user, "UserSession").set("fullNameUserSession", name);
		return dao.mysql.menus.findByUser(user.id_usuario);
	})
	.then(menus => {
		let fn = req.startSession().getSessionHelper() || fnAdmin; //exists helper?
		fn(req, res.set("menus", menus).i18nOk("msgLogin")); //update user menu
	})
	.catch(err => {
		fnLogError(req, res.addSuffix(sv.getErrors(), "ErrText"));
	});*/
}
