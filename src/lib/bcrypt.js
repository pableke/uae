
const bcrypt = require("bcrypt");

//Error handlers
function fnErrorBcrypt(err) {
	console.log("\n--------------------", "Bcrypt", "--------------------");
	console.log("> " + (new Date()));
	console.log("--------------------", "Error", "---------------------");
	//err.message = "Error " + err.errno + ": " + err.sqlMessage;
	console.log(err);
	console.log("--------------------", "Bcrypt", "--------------------\n");
	return err;
}

exports.hash = function(pass) {
	return new Promise(function(resolve, reject) {
		bcrypt.hash(pass, 10, (err, hash) => {
			err ? reject(fnErrorBcrypt(err)) : resolve(hash);
		});
	});
}

exports.compare = function(pass, encrypted) {
	return new Promise(function(resolve, reject) {
		bcrypt.compare(pass, encrypted, (err, isPasswordMatch) => {
			err ? reject(fnErrorBcrypt(err)) : resolve(isPasswordMatch);
		});
	});
}
