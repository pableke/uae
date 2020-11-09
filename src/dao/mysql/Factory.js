
const mysql = require("mysql");
const Access = require("./Access");
const Articulo = require("./Articulo");
const Familia = require("./Familia");
const Fichero = require("./Fichero");
const Menus = require("./menus");
const MenuUsuario = require("./menu-usuario");
const Usuarios = require("./usuarios");

const pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: "company",
	port: 3306, //default mysql port
	connectionLimit: 5, //important!
	//execute multiple querys separated by ";"
	multipleStatements: false,
	debug: false
});

function fnError(err) {
	console.log("\n--------------------", "MySql", "--------------------");
	console.log("> " + (new Date()));
	console.log("--------------------", "Error", "--------------------");
	err.message = "Error " + err.errno + ": " + err.sqlMessage;
	console.log(err);
	console.log("--------------------", "MySql", "--------------------\n");
	return err;
}
function query(sql, params) {
	//console.log("MySql> " + sql);
	return new Promise(function(resolve, reject) {
		pool.getConnection(function(err, connection) {
			if (!connection)
				return reject(fnError("BD connection fail!"));
			if (err) {
				connection.release();
				return reject(fnError(err));
			}

			try { //throw the query to mysql server
				connection.query(sql, params, function(err, results) {
					connection.release();
					return err ? reject(fnError(err)) : resolve(results);
				});
			} catch(ex) {
				return reject(fnError(ex));
			}
		});
	});
}

//tables
exports.menus = new Menus(query);
exports.menuUsuario = new MenuUsuario(query);
exports.usuarios = new Usuarios(query);

//open / close connection
exports.open = function() {
	console.log("> MySql pool open.");
};

exports.close = function() {
	pool.end();
	console.log("> MySql pool closed.");
};
