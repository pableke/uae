
const bcrypt = require("bcrypt"); //encrypt
const fetch = require("node-fetch"); //HTTP calls
const valid = require("validate-box"); //validators
const mailer = require("../lib/mailer"); //validators
const dao = require("../dao/Factory"); //bd connection

//Public acttions
exports.inicio = function(req, res) {
	res.set("tplSection", "src/tpl/list/index.html").set("idUsuario", 1).set("steps", []).render();
}
exports.trabajando = function(req, res) {
	res.set("tplSection", "src/tpl/trabajando.html")
		.set("steps", [{ pref: "trabajando.html", text: res.data.msgTrabajando }])
		.render();
}
exports.lang = function(req, res) {
	res.lang(req).render(); //re-render same site
}

//Public forms (loggin, contact, reactive, new user)
function fnError(msg, code, num) {
	return { errno: num || -1, code: code, message: msg };
}

function fnAdmin(req, res) {
    if (!req.logged() || req.expired())
		return fnLogout(req, res.i18nError("err401"));
	res.set("tplSection", "src/tpl/list/admin.html")
		.set("steps", [{ pref: "admin.html", text: res.data.lblAdmin }])
		.render();
}
exports.admin = fnAdmin;

function fnLogin(req, res) {
	res.set("tplSection", "src/tpl/forms/public/login.html")
		.set("steps", [{ pref: "login.html", text: res.data.lblFormLogin }])
		.render();
}
function fnLogError(req, res) { fnLogin(req, res.i18nError("errLogin")); } //go login form with error
function fnLogView(req, res) { fnLogin(req, res.flush("usuarioValue").flush("usuarioErrText").flush("claveErrText")); }
exports.logView = fnLogView;

exports.login = function(req, res) {
	let fields = req.body; //request fields
	(valid.init().size(fields.usuario, 8, 200) && valid.login(fields.usuario)) || valid.setError("usuario", res.get("errUsuario"));
	(valid.size(fields.clave, 8, 200) && valid.login(fields.clave)) || valid.setError("clave", res.get("errClave"));
	if (valid.isError()) //fields error?
		return fnLogError(req, res.addBySuffix(valid.getErrors(), "ErrText"));
	let user = dao.myjson.usuarios.findByLogin(fields.usuario);
	if (!user)
		return fnLogError(req, res.copy("usuarioErrText", "errUsuario"));

	res.set("usuarioValue", fields.usuario);
	if (bcrypt.compareSync(fields.clave, user.clave)) {
		res.set("idUserSession", user._id).set("userMail", user.correo)
			.set("userName", user.nombre).set("userAp1", user.ap1).set("userAp2", user.ap2)
			.set("fullUserName", (user.nombre + " " + user.ap1 + " " + user.ap2).trim());
		let fn = req.startSession().getSessionHelper() || fnAdmin; //exists helper?
		fn(req, res.set("menus", dao.myjson.menus.findByUser(user._id)).i18nOk("msgLogin")); //update user menu
	}
	else
		fnLogError(req, res.copy("claveErrText", "errClave"));

	/*dao.mysql.usuarios.findByLogin(fields.usuario, fields.clave).then(usuario => {
		res.set("idUserSession", usuario.id_usuario).set("userMail", usuario.correo)
			.set("userName", usuario.nombre).set("userAp1", usuario.apellido1).set("userAp2", usuario.apellido2)
			.set("fullUserName", (usuario.nombre + " " + usuario.apellido1 + " " + usuario.apellido2).trim());
		return dao.mysql.menus.findByUser(usuario.id_usuario);
	})
	.then(menus => {
		let fn = res.startSession().getSessionHelper() || fnAdmin; //exists helper?
		fn(req, res.set("menus", menus).i18nOk("msgLogin")); //update user menu
	})
	.catch(err => {
		res.copy(err.code + "ErrText", err.message);
		fnLogin(req, res.i18nError("errLogin"));
	});*/
}

function fnLogout(req, res) {
	//let menus = dao.mysql.menus.findPublic().then(...);
	let menus = dao.myjson.menus.findPublic();
	fnLogView(req.closeSession(), res.set("menus", menus).delete("startSession"));
}
exports.logout = function(req, res) { fnLogout(req, res.i18nOk("msgLogout")); };

function fnContact(req, res) {
	let sysdate = valid.dt.isoDate(res.get("sysdate"));
	res.set("tplSection", "src/tpl/forms/public/contact.html").set("ejDate", sysdate)
		.set("steps", [{ pref: "contact.html", text: res.data.lblFormContact }]).render();
}
exports.contactView = function(req, res) {
	res.flush("nombreVal").flush("nombreErrText").flush("emailVal").flush("emailErrText")
		.flush("asuntoVal").flush("asuntoErrText").flush("infoVal").flush("infoErrText");
	fnContact(req, res);
}
exports.contact = function(req, res) {
	let fields = req.body; //request fields
	let error = valid.size(fields.nombre, 1, 200) ? null : res.get("errNombre"); //init valid form indicator
	error = (valid.size(fields.email, 1, 200) && valid.email(fields.email)) ? error : res.get("errCorreo");
	error = valid.size(fields.asunto, 1, 200) ? error : res.get("errAsunto");
	error = valid.size(fields.info, 1, 600) ? error : res.get("errAsunto");
	if (error) //fields error?
		return res.error(error);

	res.set("tplSection", "src/tpl/mails/contact.html");
	let html = res.build("src/tpl/mails/index.html").getValue();
	mailer.send("pablo.rosique@upct.es", "Email de contacto", html)
		.then(info => { res.text(res.get("msgCorreo")); })
		.catch(err => { res.error(err.message); });
}

function fnReactive(req, res) {
	res.set("tplSection", "src/tpl/forms/public/reactive.html").set("steps", [{ pref: "reactive.html", text: res.data.lblReactivar }]).render();
}
exports.reactiveView = function(req, res) {
	fnReactive(req, res.flush("emailErrText"));
}
exports.reactive = function(req, res) {
	let fields = req.body; //request fields
	let error = fields.token ? null : res.get("errCaptcha"); //init valid form indicator
	error = (valid.size(fields.email, 1, 200) && valid.email(fields.email)) ? error : res.get("errCorreo");
	if (error) //fields error?
		return res.error(error);

	//https://www.google.com/recaptcha/intro/v3.html
	let pass = valid.generatePassword(); //build a new secure password
	const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_PRIVATE}&response=` + fields.token;
	fetch(url, { method: "post" })
		.then(res => res.json())
		.then(gresponse => {
			if (gresponse.success && (gresponse.score > 0.5))
				//return dao.mysql.usuarios.updatePassByMail(fields.email, pass);
				return dao.myjson.usuarios.updatePassByMail(fields.email, pass);
			else
				throw valid.setError("captcha", res.get("errCaptcha")).setMessage(res.get("errCaptcha")).getError(); //stop resolves and call catch
		})
		.then(result => {
			//if (result.changedRows == 1) {
				res.set("tplSection", "src/tpl/mails/reactive.html").set("pass", pass);
				let html = res.build("src/tpl/mails/index.html").getValue();
				return mailer.send(fields.email, "Email de reactivación", html);
			//}
			//else
				//throw fnError(res.get("errUpdate"), "password", 1); //stop resolves and call catch
		})
		.then(info => { res.text(res.get("msgReactive")); })
		.catch(err => { res.error(err.message); });
}

function fnUsuario(req, res) {
	res.set("tplSection", "src/tpl/forms/public/user.html").set("steps", [{ pref: "user.html", text: res.data.lblFormRegistro }]).render();
}
exports.usuarioView = function(req, res) {
	fnUsuario(req, res.flush("nombreErrText").flush("apellido1ErrText").flush("apellido2ErrText").flush("nifErrText").flush("emailErrText"));
}
exports.usuario = function(req, res) {
	let fields = req.body; //request fields
	let error = fields.token ? null : res.get("errCaptcha"); //init valid form indicator
	error = (valid.size(fields.nombre, 1, 200) && valid.size(fields.apellido1, 1, 200)) ? error : res.get("errNombre"); //same error for name and surname
	error = valid.size(fields.apellido2, 0, 200) ? error : res.get("errNombre"); //same error for name and surname
	error = (valid.size(fields.nif, 1, 50) && valid.esId(fields.nif)) ? error : res.get("errNif");
	error = (valid.size(fields.email, 1, 200) && valid.email(fields.email)) ? error : res.get("errCorreo");
	if (error) //fields error?
		return res.error(error);

	//https://www.google.com/recaptcha/intro/v3.html
	let pass = valid.generatePassword(); //build a new secure password
	const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_PRIVATE}&response=` + fields.token;
	fetch(url, { method: "post" })
		.then(res => res.json())
		.then(gresponse => {
			if (gresponse.success && (gresponse.score > 0.5))
				return dao.mysql.usuarios.insert(fields.nif, fields.nombre, fields.apellido1, fields.apellido2, fields.email, pass, 0, res.get("sysdate"));
			else
				throw fnError(res.get("errCaptcha"), "captcha"); //stop resolves and call catch
		})
		.then(result => {
			if ((result.affectedRows == 1) && (result.insertId > 0)) {
				res.set("tplSection", "src/tpl/mails/user.html").set("pass", pass);
				let html = res.build("src/tpl/mails/index.html").getValue();
				return mailer.send(fields.email, "Email de alta", html);
			}
			else
				throw fnError(res.get("errAlta"), "user", 1); //stop resolves and call catch
		})
		.then(info => { res.text(res.get("msgUsuario")); })
		.catch(err => {
			res.error((err.errno == 1062) ? res.get("errUsuarioUk") : err.message);
		});
}
