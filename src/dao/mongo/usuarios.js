
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/*const Usuario = new mongoose.Schema({
	nif: String,
	nombre: String,
	apellido1: String,
	apellido2: String,
	correo: String,
	clave: String,
	mask: Integer,
	f_creacion: Date
});*/

//Error handlers
function fnErrorUser(msg, code, num) {
	return { errno: num || -1, code: code, message: msg };
}
function fnErrorBcrypt(err) {
	console.log("\n--------------------", "Bcrypt", "--------------------");
	console.log("> " + (new Date()));
	console.log("--------------------", "Error", "--------------------");
	//err.message = "Error " + err.errno + ": " + err.sqlMessage;
	console.log(err);
	return err;
}

//User DAO
module.exports = function() {
	this.findAll = function() { return query("select * from v_usuarios order by nombre"); };
	this.findById = function(id) { return query("select * from v_usuarios where id_usuario = ?", [id]); };

	this.findByLogin = function(log, pass) {
		Usuario.find()
		return new Promise(function(resolve, reject) {
			let params = [log.toUpperCase(), log.toLowerCase()];
			query("select * from usuarios where (nif = ?) or (correo = ?)", params).then(results => {
				if (!results || (results.length != 1))
					return reject(fnErrorUser("errUsuario", "usuario", 1));
				bcrypt.compare(pass, results[0].clave, function(err, isPasswordMatch) {
					return err ? reject(fnErrorBcrypt(err)) 
							: (isPasswordMatch ? resolve(results[0]) : reject(fnErrorUser("errClave", "clave", 2)));
				});
			});
		});
	}
	this.findByMail = function(email) { return query("select * from v_usuarios where correo = ?", [email]); }
	this.findByNif = function(nif) { return query("select * from v_usuarios where nif = ?", [nif]); }

	this.insert = function(nif, nombre, ap1, ap2, correo, pass, mask, fecha) {
		return new Promise(function(resolve, reject) {
			bcrypt.hash(pass, 10, (err, hash) => {
				if (err)
					return reject(fnErrorBcrypt(err));
				let sql = "INSERT INTO `usuarios` (`nif`, `nombre`, `apellido1`, `apellido2`, `correo`, `clave`, `mask`, `f_creacion`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
				query(sql, [nif.toUpperCase(), nombre, ap1, ap2, correo.toLowerCase(), hash, mask, fecha]).then(resolve).catch(reject);
			});
		});
	}
	this.update = function(id, nif, nombre, ap1, ap2, correo, mask, fecha) { //not to update pass
		let sql = "UPDATE `usuarios` SET `nif` = ?, `nombre` = ?, `apellido1` = ?, `apellido2` = ?, `correo` = ?, `mask` = ?, `f_creacion` = ? WHERE `id_usuario` = ?";
		return query(sql, [nif.toUpperCase(), nombre, ap1, ap2, correo.toLowerCase(), mask, fecha, id]);
	}
	this.updatePassByMail = function(correo, pass) {
		return new Promise(function(resolve, reject) {
			bcrypt.hash(pass, 10, (err, hash) => {
				if (err)
					return reject(fnErrorBcrypt(err));
				let sql = "UPDATE `usuarios` SET `clave` = ? WHERE `correo` = ?";
				query(sql, [hash, correo.toLowerCase()]).then(resolve).catch(reject);
			});
		});
	}
	this.updateNewPass = function(id, oldPass, newPass) {
		return new Promise(function(resolve, reject) {
			query("select * from usuarios where (id_usuario = ?)", [id]).then(results => {
				if (!results || (results.length != 1))
					return reject(fnErrorUser("errUsuario", "usuario", 1));
				bcrypt.compare(oldPass, results[0].clave, function(err, isPasswordMatch) {
					return err ? reject(fnErrorBcrypt(err)) 
							: (isPasswordMatch ? this.updatePassByMail(results[0].clave.correo, newPass).then(resolve).catch(reject)
							: reject(fnErrorUser("errClave", "clave", 2)));
				});
			});
		});
	}
	this.save = function(id, nif, nombre, ap1, ap2, correo, pass, mask, fecha) {
		return id ? this.update(id, nif, nombre, ap1, ap2, correo, pass, mask, fecha)
				: this.insert(nif, nombre, ap1, ap2, correo, pass, mask, fecha);
	}
	this.delete = function(id) {
		return query("DELETE FROM `usuarios` WHERE (id_usuario = ?)",  [id]);
	}
}
