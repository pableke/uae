
const dao = require("../../dao/Factory"); //bd factory
const sv = require("../../lib/validator");
const { nb, sb } = require("validate-box"); //validators

exports.save = function(_id, name, price, info) {
	price = nb.toFloat(price); //get float value
	if (!sv.product(name, price, info)) //exists?
		return sv.getErrors(); //return error description

	let product = { _id, name, price, info };
	dao.myjson.productos.save(product);
	return product;
}

const TEMPLATE ='<div class="card card-body m-2 animated fadeInRight"><h4>@name;</h4><p>@info;</p><h3>@price; &euro;</h3><p><button class="btn btn-danger btn-sm" data-id="@_id;">Delete</button><button class="btn btn-secondary btn-sm ml-1" data-id="@_id;">Edit</button></p></div>';
exports.search = function(args) {
	//prepare filter extended
	let name = sb.tr(args.name);
	let price = nb.toFloat(args.price);
	let info = sb.tr(args.info);

	let fnPrice = nb.isNumber(price)
						? (p) => { return (p == price); }
						: (p) => { return true; };

	//filter table
	let products = dao.myjson.productos.filter((p, i) => {
		return (sb.tr(p.name).indexOf(name) > -1) && fnPrice(p.price) && (sb.tr(p.info).indexOf(info) > -1);
	});
	return dao.myjson.format(TEMPLATE, products, { price: nb.float });
}

exports.getById = function(id) {
	return dao.myjson.productos.findById(id);
}

exports.deleteById = function(id) {
	return dao.myjson.productos.deleteById(id);
}
