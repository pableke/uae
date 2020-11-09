
const valid = require("validate-box"); //validators
const dao = require("../dao/Factory"); //bd factory

exports.save = function(_id, name, price, info) {
	price = parseFloat(price) || 0;
	dao.myjson.productos.save({ _id, name, price, info });
}

exports.getAll = function() {
	return dao.myjson.productos.findAll();
}
exports.formatAll = function(str) {
	return dao.myjson.productos.format(str, dao.myjson.productos.findAll());
}

exports.getById = function(id) {
	return dao.myjson.productos.findById(id);
}

exports.deleteById = function(id) {
	return dao.myjson.productos.deleteById(id);
}
