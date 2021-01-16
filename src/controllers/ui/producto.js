
const dao = require("../../dao/Factory"); //bd factory
const sv = require("./validators");

exports.save = function(_id, name, price, info) {
	price = sv.toFloat(price); //get float value
	if (!sv.product(name, price, info)) //exists?
		return sv.getErrors(); //return error description

	let product = { _id, name, price, info };
	dao.myjson.productos.save(product);
	return product;
}

const TEMPLATE ='<div class="card card-body m-2 animated fadeInRight"><h4>@name;</h4><p>@info;</p><h3>@price; &euro;</h3><p><button class="btn btn-danger btn-sm" data-id="@_id;">Delete</button><button class="btn btn-secondary btn-sm ml-1" data-id="@_id;">Edit</button></p></div>';
exports.search = function(args) {
	//prepare filter extended
	let name = sv.tr(args.name);
	let price = sv.toFloat(args.price);
	let info = sv.tr(args.info);

	let fnPrice = sv.isNumber(price)
						? (p) => { return (p == price); }
						: (p) => { return true; };

	//filter table
	let products = dao.myjson.productos.filter((p, i) => {
		return (sv.tr(p.name).indexOf(name) > -1) && fnPrice(p.price) && (sv.tr(p.info).indexOf(info) > -1);
	});
	return dao.myjson.format(TEMPLATE, products, { price: sv.float });
}

exports.getById = function(id) {
	return dao.myjson.productos.findById(id);
}

exports.deleteById = function(id) {
	return dao.myjson.productos.deleteById(id);
}
