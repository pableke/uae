
const { hash } = require("bcrypt");
const bcrypt = require("../../lib/bcrypt");

//Error handlers
function fnErrorUser(msg, code, num) {
	return { errno: num || -1, code: code, message: msg };
}

//User DAO
module.exports = function(query) {
	const self = this; //self instance

	this.findAll = function() { return query("select * from v_usuarios order by nombre"); };
	this.findById = function(id) { return query("select * from v_usuarios where id_usuario = ?", [id]); };

	this.findByLogin = function(log, pass) {
		let params = [log.toUpperCase(), log.toLowerCase()];
		return query("select * from usuarios where (nif = ?) or (correo = ?)", params).then(results => {
			if (!results || (results.length != 1)) 
				throw fnErrorUser("errUsuario", "usuario", 1) 
			return bcrypt.compare(pass, results[0].clave).then(ok => {
				if (ok) return results[0];
				throw fnErrorUser("errClave", "clave", 2);
			});
		});
	}
	this.findByMail = function(email) { return query("select * from v_usuarios where correo = ?", [email]); }
	this.findByNif = function(nif) { return query("select * from v_usuarios where nif = ?", [nif]); }

	this.insert = function(nif, nombre, ap1, ap2, correo, pass, mask, fecha) {
		return bcrypt.hash(pass).then(hash => {
			let sql = "INSERT INTO `usuarios` (`nif`, `nombre`, `apellido1`, `apellido2`, `correo`, `clave`, `mask`, `f_creacion`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			return query(sql, [nif.toUpperCase(), nombre, ap1, ap2, correo.toLowerCase(), hash, mask, fecha]);
		});
	}
	this.update = function(id, nif, nombre, ap1, ap2, correo, mask, fecha) { //not to update pass
		let sql = "UPDATE `usuarios` SET `nif` = ?, `nombre` = ?, `apellido1` = ?, `apellido2` = ?, `correo` = ?, `mask` = ?, `f_creacion` = ? WHERE `id_usuario` = ?";
		return query(sql, [nif.toUpperCase(), nombre, ap1, ap2, correo.toLowerCase(), mask, fecha, id]);
	}
	this.updatePassByMail = function(correo, pass) {
		return bcrypt.hash(pass).then(hash => {
			let sql = "UPDATE `usuarios` SET `clave` = ? WHERE `correo` = ?";
			return query(sql, [hash, correo.toLowerCase()]);
		});
	}
	this.updateNewPass = function(id, oldPass, newPass) {
		return query("select * from usuarios where (id_usuario = ?)", [id]).then(results => {
			if (!results || (results.length != 1))
				throw fnErrorUser("errUserNotFound", "usuario", 1);
			return bcrypt.compare(oldPass, results[0].clave).then(isPasswordMatch => {
				if (isPasswordMatch)
					return self.updatePassByMail(results[0].correo, newPass)
				throw fnErrorUser("errClave", "oldPass", 2);
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
