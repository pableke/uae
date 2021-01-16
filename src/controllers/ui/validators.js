
/**
 * UI Validator Service
 * @module Validator
 */

const valid = require("validate-box"); //validators
const { mb, nb, sb } = valid; //declare message-box, number-box, and string-box modules

/**
 * Product fields validator
 *
 * @function product
 * @param      {string}  name    The name asociated
 * @param      {number}  price   The price of the product
 * @param      {string}  info    Long information / description asociated to product
 * @return     {boolean}  True if all fields are valids or false otherwise
 */
exports.product = function(name, price, info) {
	mb.init(); //starts validation
	nb.gt0(price) || mb.i18nError("price", "errImporte0"); //validate float value
	valid.size(name, 1, 200) || mb.i18nError("name", "errRequired");
	valid.size(info, 1, 400) || mb.i18nError("info", "errRequired");
	return mb.isOk();
}

exports.tr = sb.tr;
exports.isNumber = nb.isNumber;
exports.toFloat = nb.toFloat;
exports.float = nb.float;
