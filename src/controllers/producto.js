
const valid = require("validate-box"); //validators
const dao = require("../dao/Factory"); //bd factory

exports.save = function(_id, name, price, info) {
	valid.init(); //initialize validation
	price = price ? valid.nb.toFloat(price) : 0; //validate price format as string
	(price > 0) || valid.setError("price", "El importe debe ser mayor de " + valid.nb.float(0) + " &euro;", 2); //validate float value
	valid.size(name, 1, 200) || valid.setError("name", "Nonmbre del producto no válido", 1);
	valid.size(info, 1, 400) || valid.setError("info", "La descripción asociada no es válida", 3);
	if (valid.isError()) //exists?
		return valid.getError(); //return error description

	let product = { _id, name, price, info };
	dao.myjson.productos.save(product);
	return product;
}

const TEMPLATE ='<div class="card card-body m-2 animated fadeInRight"><h4>@name;</h4><p>@info;</p><h3>@price; &euro;</h3><p><button class="btn btn-danger btn-sm" data-id="@_id;">Delete</button><button class="btn btn-secondary btn-sm ml-1" data-id="@_id;">Edit</button></p></div>';
exports.search = function(args) {
	//prepare filter extended
	let name = valid.sb.tr(args.name);
	args.price = valid.sb.trim(args.price);
	let price = args.price && valid.nb.toFloat(args.price);
	let info = valid.sb.tr(args.info);

	let fnPrice = valid.nb.isNumber(price)
						? (p) => { return (p == price); }
						: (p) => { return true; };

	//filter table
	let products = dao.myjson.productos.filter((p, i) => {
		return (valid.sb.tr(p.name).indexOf(name) > -1) && fnPrice(p.price)
				&& (valid.sb.tr(p.info).indexOf(info) > -1);
	});
	return dao.myjson.format(TEMPLATE, products, { price: valid.nb.float });
}

exports.getById = function(id) {
	return dao.myjson.productos.findById(id);
}

exports.deleteById = function(id) {
	return dao.myjson.productos.deleteById(id);
}
