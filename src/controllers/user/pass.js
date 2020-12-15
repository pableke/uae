
const dao = require("../../dao/Factory"); //bd connection
const sv = require("../../lib/validator");
const login = require("../public/login");

function fnPassClear(req, res) {
	return res.flush("oldPassErrText").flush("newPassErrText").flush("rePassErrText");
}

function fnPassView(req, res) {
	res.set("tplSection", "dist/forms/user/pass.html")
		.set("steps", [{ pref: "/pass.html", text: res.data.lblFormClave }])
		.render();
}

exports.passView = function(req, res) {
	if (!login.isLogged(req, res))
		return login.logError(req, res);
	fnPassView(req, fnPassClear(req, res));
}

exports.password = function(req, res) {
	if (!login.isLogged(req, res))
		return login.logError(req, res);

	fnPassClear(req, res);
	let fields = req.body; //request fields
	if (!sv.password(fields.oldPass, fields.newPass, fields.rePass)) { //fields error?
		res.addSuffix(sv.getErrors(), "ErrText").set("msgError", "errUpdate");
		return fnPassView(req, res);
	}

	//dao.mysql.usuarios.updateNewPass(res.get("_idUserSession"), fields.oldPass, fields.newPass).then(result => {
	dao.myjson.usuarios.updateNewPass(res.get("_idUserSession"), fields.oldPass, fields.newPass).then(result => {
		//if (result.changedRows == 1)
			login.admin(req, res.set("msgOk", "msgChangePassOk"));
		//else
			//fnPassView(req, res.get("errUpdate")); //stop resolves and call catch
	}).catch(err => {
		fnPassView(req, res.set("msgError", "errUpdate"));
	});
}
