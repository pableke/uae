
const valid = require("validate-box"); //validators
const dao = require("../dao/Factory"); //bd factory

const ERROR = { errno: 0, code: "product-not-valid" };

function initError() {
	ERROR.errno = 0;
}
function setError(name, msg, errno) {
	ERROR.errno = errno;
	ERROR[name] = msg;
}

exports.save = function(_id, name, price, info) {
	initError(); //reset error messages
	valid.size(name, 1, 200) || setError("name", "Nonmbre del producto no válido", 1);
	price = price ? valid.nb.toFloat(price) : 0;
	(price > 0) || setError("price", "El importe debe ser mayor de " + valid.nb.float(0) + " &euro;", 2);
	valid.size(info, 1, 400) || setError("info", "La descripción asociada no es válida", 3);

	if (ERROR.errno) //exists?
		return ERROR; //return error description
	let product = { _id, name, price, info };
	dao.myjson.productos.save(product);
	return product;
}

exports.getAll = function() {
	return dao.myjson.productos.findAll();
}
exports.formatAll = function(str) {
	return dao.myjson.format(str, dao.myjson.productos.findAll(), { price: valid.nb.float });
}

exports.getById = function(id) {
	return dao.myjson.productos.findById(id);
}

exports.deleteById = function(id) {
	return dao.myjson.productos.deleteById(id);
}
