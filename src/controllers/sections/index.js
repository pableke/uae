
const valid = require("validate-box"); //validators

// Settings
const i18n = { //aviable languages list
	"es": require("../../i18n/es.js"), 
	"en": require("../../i18n/en.js")
};

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

function fnLang(req, res) {
	let lang = req.params.lang || res.data.lang;
	if (!lang || (lang !== res.data.lang)) {
		//user has changed current language or first access
		let ac = req.headers["accept-language"] || "es"; //default laguage = es
		lang = (i18n[lang]) ? lang : ac.substr(0, 5); //search region language es-ES
		lang = (i18n[lang]) ? lang : lang.substr(0, 2); //search type language es
		lang = (i18n[lang]) ? lang : "es"; //default language = es
		res.set("lang", lang).add(i18n[lang]).nvl("startSession", ""); //add lang values
	}
	valid.setI18n(lang) //init date, messages and numbers format
	valid.mb.setMessages(res.data); //set messages
	return res;
}

exports.setLang = fnLang;
exports.lang = function(req, res) {
	fnLang(req, res).render(); //re-render same site
}
