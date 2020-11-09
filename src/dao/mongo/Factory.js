
const mongoose = require("mongoose");
const Menus = require("./menus");
const MenuUsuario = require("./menu-usuario");
const Usuarios = require("./usuarios");

function fnError(err) {
	console.log("\n--------------------", "Mongoose", "--------------------");
	console.log("> " + (new Date()));
	console.log("--------------------", "Error", "--------------------");
	//err.message = "Error " + err.errno + ": " + err.sqlMessage;
	console.log(err);
	return err;
}
//Collections

//exports.menus = new Menus();
//exports.menuUsuario = new MenuUsuario();
exports.usuarios = new Usuarios();

//open / close connection
exports.open = function(opts) {
	// connection to db
	mongoose.connect("mongodb://localhost/company", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	})
	.then(db => console.log("> Mongo DB open."))
	.catch(fnError);
};

exports.close = function() {
	mongoose.disconnect();
	console.log("> Mongo DB closed.");
};
