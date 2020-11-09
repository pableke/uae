
const bcrypt = require("bcrypt"); //encrypt

//Usuario DAO
module.exports = function(db, usuarios) {
	usuarios.findByMail = function(email) { return usuarios.find(user => (user.correo == email)); }
	usuarios.findByNif = function(nif) { return usuarios.find(user => (user.nif == nif)); }

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
					: Promise.reject("errUpdate");
	}
	usuarios.updateNewPass = function(id, oldPass, newPass) {
		let user = usuarios.findById(id);
		if (user) {
			return bcrypt.compareSync(oldPass, user.clave) 
						? updatePass(user, newPass).commit() 
						: Promise.reject("errClave");
		}
		return Promise.reject("errUserNotFound");
	}

	return usuarios;
}
