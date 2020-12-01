
const bcrypt = require("bcrypt"); //encrypt
const fetch = require("node-fetch"); //HTTP calls
const mailer = require("../lib/mailer"); //validators
const dao = require("../dao/Factory"); //bd connection
const valid = require("../services/validator");

//Public forms (loggin, contact, reactive, new user)
exports.inicio = function(req, res) {
	res.set("tplSection", "dist/sections/index.html").set("idUsuario", 1).set("steps", []).render();
}
exports.section = function(req, res) {
	let section = req.params.s || "sidebar";
	res.render("dist/sections/" + section + ".html");
}
exports.trabajando = function(req, res) {
	res.set("tplSection", "dist/trabajando.html")
		.set("steps", [{ pref: "trabajando.html", text: res.data.msgTrabajando }])
		.render();
}
exports.lang = function(req, res) {
	res.lang(req, res).render(); //re-render same site
}



