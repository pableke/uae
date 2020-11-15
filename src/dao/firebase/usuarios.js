
const bcrypt = require("bcrypt"); //encrypt
const valid = require("validate-box"); //validators

//Usuario DAO
module.exports = function(db) {
	const self = this; //self instance

	this.findAll = function() { return db.ref("usuarios").once('value', (snapshot) => {}); };
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
}

//db.ref('contacts').push(newContact);
//db.ref('contacts/' + req.params.id).remove();
