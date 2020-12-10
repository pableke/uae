
/**
 * Router Service
 * @module Router
 */

const GET = {};
const POST = {};

function fnFind(method, name) {
	return (method == "POST") ? POST[name] : GET[name];
}

exports.find = fnFind;

/**
 * Searches for the first match route in GET/POST request method
 *
 * @function search
 * @param      {Object}  req       The request object
 * @param      {string}  pathname  The URL pathname
 * @return     {function}  The function associated to the route by pathname to build response
 */
exports.search = function(req, pathname) {
	let i = pathname.lastIndexOf("."); //last dot in url pathname
	return fnFind(req.method, (i > 0) ? pathname.substr(0, i) : pathname); //remove extension
}

/**
 * Add a new function for GET method associated to name
 *
 * @function get
 * @param      {string}    name      The pathname associated to callback
 * @param      {Function}  callback  The callback associated to pathname
 * @return     {Router}    Auto self instance
 */
exports.get = function(name, callback) {
	GET[name] = callback;
	return this;
}

/**
 * Add a new function for POST method associated to name
 *
 * @function post
 * @param      {string}    name      The pathname associated to callback
 * @param      {Function}  callback  The callback associated to pathname
 * @return     {Router}    Auto self instance
 */
exports.post = function(name, callback) {
	POST[name] = callback;
	return this;
}
