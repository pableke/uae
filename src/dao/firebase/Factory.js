
const fb = require("firebase-admin");
const Menus = require("./menus");
const MenuUsuario = require("./menu-usuario");
const Usuarios = require("./usuarios");

const serviceAccount = require("../../../firebase.json");
fb.initializeApp({
	credential: fb.credential.cert(serviceAccount),
	databaseURL: "https://uae-web.firebaseio.com/"
});
const db = fb.firestore();

//tables
exports.menus = new Menus(db);
exports.menuUsuario = new MenuUsuario(db);
exports.usuarios = new Usuarios(db);

exports.open = function() {
	console.log("> FireBase DB open.");
	return this;
};

exports.close = function() {
	console.log("> FireBase DB closed.");
	return this;
};
