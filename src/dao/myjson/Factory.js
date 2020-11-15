
const myjson = require("myjson-box");
const menus = require("./menus");
const menu_usuario = require("./menu-usuario");
const productos = require("./productos");
const usuarios = require("./usuarios");

const self = this; //self instance

exports.open = function() {
	myjson.open().then(dbs => {
		self.format = dbs.company.format;
		dbs.company.get("usuarios").then(table => {
			self.usuarios = usuarios(dbs.company, table);
			return table.get("menu-usuario");
		}).then(table => {
			self.menuUsuario = menu_usuario(dbs.company, table);
			return table.get("menus");
		}).then(table => {
			self.menus = menus(dbs.company, table);
			return table.get("productos");
		}).then(table => {
			self.productos = productos(dbs.company, table);
		});
		console.log("> MyJson DB open.");
	});
	return this;
};

exports.close = function() {
	myjson.close().then(() => {
		console.log("> MyJson DB closed.");
	});
	return this;
};
