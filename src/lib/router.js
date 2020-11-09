
const GET = {};
const POST = {};

exports.find = function(method, name) { return (method == "POST") ? POST[name] : GET[name]; }
exports.route = function(req, name) { return this.find(req.method, name); }
exports.get = function(name, callback) { GET[name] = callback; return this; }
exports.post = function(name, callback) { POST[name] = callback; return this; }
