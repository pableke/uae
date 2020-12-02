
const GET = {};
const POST = {};

function fnFind(method, name) {
	return (method == "POST") ? POST[name] : GET[name];
}

exports.find = fnFind;
exports.search = function(req, pathname) {
	let i = pathname.lastIndexOf("."); //last dot in url pathname
	return fnFind(req.method, (i > 0) ? pathname.substr(0, i) : pathname); //remove extension
}

exports.get = function(name, callback) {
	GET[name] = callback;
	return this;
}

exports.post = function(name, callback) {
	POST[name] = callback;
	return this;
}
