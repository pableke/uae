
const bcrypt = require("bcrypt"); //encrypt
const valid = require("validate-box"); //validators

//Usuario DAO
module.exports = function(db, usuarios) {
	usuarios.findByMail = function(email) { return usuarios.find(user => (user.correo == email)); }
	usuarios.findByNif = function(nif) { return usuarios.find(user => (user.nif == nif)); }
	usuarios.findLogin = function(nif, email) {
		let nif = nif.toUpperCase();
		let email = email.toLowerCase();
		return usuarios.find(user => ((user.nif == nif) || (user.correo == email)));
	}

	usuarios.findByLogin = (login) => { 
		let nif = login.toUpperCase();
		let email = login.toLowerCase();
		return usuarios.find(user => ((user.nif == nif) || (user.correo == email)));
	}

	function updatePass(user, pass) {
		user.clave = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
		return usuarios;		
	}
	usuarios.updatePassByMail = function(email, pass) {
		let user = usuarios.findByMail(email.toLowerCase());
		return user ? updatePass(user, pass).commit()
					: Promise.reject(valid.setMessage("errUpdate").getError());
	}
	usuarios.updateNewPass = function(id, oldPass, newPass) {
		let user = usuarios.findById(id);
		if (user) {
			return bcrypt.compareSync(oldPass, user.clave) 
						? updatePass(user, newPass).commit() 
						: Promise.reject(valid.setMessage("errClave").getError());
		}
		return Promise.reject(valid.setMessage("errUserNotFound").getError());
	}

	usuarios.insertData = function(nif, nombre, ap1, ap2, correo, pass, mask, fecha) {
		if (usuarios.findLogin(nif, correo))
			return Promise.reject(valid.setMessage("errUsuarioUk").getError());
		const user = { nif, nombre, ap1, ap2, correo, mask, fecha };
		return usuarios.insert(updatePass(user, pass));
	}

	return usuarios;
}
