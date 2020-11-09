
const valid = require("validate-box"); //validators
const dao = require("../dao/Factory"); //bd factory

exports.save = function(_id, name, price, info) {
	valid.init().size(name, 1, 200) || valid.setError("name", "Nonmbre del producto no válido", 1);
	price = price ? valid.nb.toFloat(price) : 0;
	(price > 0) || valid.setError("price", "El importe debe ser mayor de " + valid.nb.float(0) + " &euro;", 2);
	valid.size(info, 1, 400) || valid.setError("info", "La descripción asociada no es válida", 3);

	if (valid.isError()) //exists?
		return valid.getError(); //return error description
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
