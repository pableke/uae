
const firebase = require("./firebase/Factory");
//const mongo = require("./mongo/Factory");
const myjson = require("./myjson/Factory");
//const mysql = require("./mysql/Factory");
const oracle = require("./oracle/Factory");
const postgre = require("./postgre/Factory");

//exports.mongo = mongo;
exports.myjson = myjson;
//exports.mysql = mysql;
exports.oracle = oracle;
exports.postgre = postgre;

exports.open = function() {
	firebase.open();
	//mongo.open();
	myjson.open();
	//mysql.open();
	oracle.open();
	postgre.open();
	console.log("> DAO Factory open.");
	return this;
};

exports.close = function() {
	firebase.close();
	//mongo.close();
	myjson.close();
	//mysql.close();
	oracle.close();
	postgre.close();
	console.log("> DAO Factory closed.");
	return this;
};
