
const RE_VAR = /@(\w+);/g;
const HTML_P = newElem("p");

function fnVoid() {};
function fnTrue() { return true; };
function fnParam(data) { return data; };
function lt(a, b) { return (a < b) ? a : b; };
function gt(a, b) { return (a > b) ? a : b; };
function lt0(num) { return isNaN(num) || (num < 0); };
function le0(num) { return isNaN(num) || (num <= 0); };
function gt0(num) { return !isNaN(num) && (num > 0); };
function cmp(a, b) { return (a == b) ? 0 : ((a < b) ? -1 : 1); };
function range(val, min, max) { return Math.min(Math.max(val, min), max); };
function between(val, min, max) { return (min <= val) && (val <= max); };
function extract(arr, i, n) { arr.splice(i, n); return arr; };
function exclude(arr, elem) { var i = arr.indexOf(elem); return (i < 0) ? arr : extract(arr, i, 1); };
function ifind(arr, name, value) { return (arr && name) ? arr.findIndex(function(obj) { return (obj[name] == value); }) : -1; };
function distinct(arr, name) { return name ? arr.filter(function(obj, i) { return (ifind(arr, name, obj[name]) == i); }) : arr; };
function swap(arr, a, b) { var aux = arr[a]; arr[a] = arr[b]; arr[b] = aux; return arr; };
function put(arr, val) { arr.push(val); return arr; };
function pull(arr) { return extract(arr, -1, 1); };

function isset(val) { return (typeof val != "undefined") && (val != null); };
function isstr(val) { return (typeof val === "string") || (val instanceof String); };
//important! (typeof null === "object") = true, and Array.isArray([]) = true
function isobj(val) { return isset(val) && (typeof val === "object") && !Array.isArray(val); };
function strval(val) { return isset(val) ? ("" + val).trim() : ""; }; //toString
function empty(val) { return !val || !val.length; }; //only for arrays and strings
function nvl(val, def) { return isset(val) ? val : def; };
function fnSize(str) { return str ? str.length : 0; }; //string o array
function fnTrim(str) { return isstr(str) ? str.trim() : str; }; //string only
function fnIO(str, chr, i) { return str ? str.indexOf(chr, i) : -1; }; //string o array
function split(val, sep) { return val ? isstr(val) ? val.split(sep) : ((Array.isArray(val) || isNaN(val)) ? val : [val]) : val; };
function apply(val, fn) { return (fn && isset(val)) ? fn(val) : val; };
function format(str, obj) { return str.replace(RE_VAR, function(m, k) { return nvl(obj[k], m); }); };
function render(str, obj, tr) { return str.replace(RE_VAR, function(m, k) { return nvl(apply(obj[k], tr[k]), m); }); };
function ucFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); };
function reEscape(str) { return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"); };
function replaceAll(str, find, replace) { return str.replace(new RegExp(reEscape(find), "g"), replace); };
function strip(str) { HTML_P.innerHTML = str; return text(HTML_P); }; //remove html entities
function minlength(str, size) { return fnSize(str) > size; };
function trunc(str, size) { return minlength(str, size) ? (str.substr(0, size).trim() + "...") : str; };
function prevIndexOf(str1, str2, i) { return str1.substr(0, i).lastIndexOf(str2); };
function itrunc(str, size) {
	var i = minlength(str, size) ? prevIndexOf(str, " ", size) : -1;
	return trunc(str, (i < 0) ? size : i);
};

//****** string functions **********//
function tr(str) {
	var output = "";
	var size = fnSize(str);
	var tr1 = "àáâãäåāăąÀÁÂÃÄÅĀĂĄÆßèéêëēĕėęěÈÉĒĔĖĘĚìíîïìĩīĭÌÍÎÏÌĨĪĬòóôõöōŏőøÒÓÔÕÖŌŎŐØùúûüũūŭůÙÚÛÜŨŪŬŮçÇñÑþÐŔŕÿÝ";
	var tr2 = "aaaaaaaaaAAAAAAAAAABeeeeeeeeeEEEEEEEiiiiiiiiIIIIIIIIoooooooooOOOOOOOOOuuuuuuuuUUUUUUUUcCnNdDRryY";
	for (var i = 0; i < size; i++) {
		var chr = str.charAt(i);
		var j = tr1.indexOf(chr);
		output += (j < 0) ? chr : tr2.charAt(j);
	}
	return output;
};
function ltr(str, size) {
	var result = []; //parts container
	var n = fnSize(str); //maxlength
	for (var i = 0; i < n; i += size)
		result.push(str.substr(i, size));
	return result;
};
function rtl(str, size) {
	var result = []; //parts container
	for (var i = fnSize(str); i > size; i -= size)
		result.unshift(str.substr(i - size, size));
	(i > 0) && result.unshift(str.substr(0, i));
	return result;
};
function slices(str, sizes) {
	var j = 0; //string position
	var result = []; //parts container
	var k = fnSize(str); //maxlength
	for (var i = 0; (i < sizes.length) && (j < k); i++) {
		var n = sizes[i];
		result.push(str.substr(j, n));
		j += n;
	}
	return (j < k) ? put(result, str.substr(j)) : result;
};
//********************************//

//****** numbers functions **********//
function dNaN(n, d) { return isNaN(n) ? d : n; };
function intval(val) { return parseInt(val) || 0; };
function floatval(val) { return parseFloat(val) || 0; };
function round(num, d) { d = dNaN(d, 2); return +(Math.round(num + "e" + d) + "e-" + d); };
function parseNumber(str, d, n) {
	str = fnTrim(str);
	if (!str) return null;
	let separator = str.lastIndexOf(d);
	let sign = (str.charAt(0) == "-") ? "-" : "";
	let whole = (separator < 0) ? str : str.substr(0, separator); //extract whole part
	let decimal = (separator < 0) ? "" : (DOT + str.substring(separator + 1)); //decimal part
	let num = parseFloat(sign + whole.replace(/\D+/g, "") + decimal);
	return isNaN(num) ? null : round(num, n); //default 2 decimals
};
function fmtNumber(num, s, d, n) {
	if (!isset(num)) return "";
	n = dNaN(n, 2); //default 2 decimals
	var decimals = d && (n > 0); //show decimals
	var sign = (num < 0) ? "-" : ""; //positive?
	var strval = round(num, n).toString();
	strval = ((num < 0) ? strval.substr(1) : strval) || "0";
	var separator = strval.lastIndexOf("."); //search in strval last decimal separator index
	return sign + ((separator < 0) ? (rtl(strval, 3).join(s) + (decimals ? (d + "0".lpad(n)) : ""))
								: (rtl(strval.substr(0, separator), 3).join(s) + (decimals ? (d + strval.substr(separator + 1).rpad(n)) : "")));
};
function npLatin(str) { return toNumber(str, ","); };
function nfIso(num, d) { return fmtNumber(num, ",", ".", d); };
function nfLatin(num, d) { return fmtNumber(num, ".", ",", d); };
function isoToLatin(str) { return str && nfLatin(parseFloat(str)); };
function nhLatin(str, d) { return str && nfLatin(npLatin(str), d); };
var toNumber = parseNumber; //sinonyms
var nfNumber = nfIso;
//********************************//

function itr(str) { return tr(fnTrim(str)).toLowerCase(); };
function iiOf(str1, str2) { return itr(str1).indexOf(itr(str2)); };
function ilike(str1, str2) { return (iiOf("" + str1, str2) > -1); }; //object value type = string
function olike(obj, names, val) { return names.some(function(k) { return ilike(obj[k], val); }); };
function alike(obj, names, val) { return val ? val.split(" ").some(function(v) { return olike(obj, names, v); }) : true; };

function newElem(name) { return document.createElement(name); };
function addChild(elem, child) { return elem.appendChild(child); };
function addElem(elem, name) { return addChild(elem, newElem(name)); };
function val(elem) { return strval(elem && elem.value); }; //get elem value
function text(elem) { return elem && fnTrim(elem.textContent); }; //get elem text
function html(elem) { return elem && fnTrim(elem.innerHTML); }; //get html text
function boolval(val) { return val && (val !== "false") && (val !== "0"); };
function redir(url, target) { return url && !window.open(url, target || "_blank"); };
function lang() { return navigator.language || navigator.userLanguage || "en"; }; //default language
function goUp(frm) { return $("html,body", frm || window.document).animate({scrollTop: 0}, 500);/*$(frm || window).scrollTop(0);*/ };
function multisort(a, b, columns, orderby, index) {
	index = index || 0;
	var name = columns[index];
	var direction = (orderby && (orderby[index] == "asc"));
	var value = direction ? cmp(a[name], b[name]) : cmp(b[name], a[name]);
	return ((value == 0) && (index < (columns.length - 1))) ? multisort(a, b, columns, orderby, index + 1) : value;
};

JSON.read = function(val) { return val ? JSON.parse(val) : null; };
JSON.get = function(name) { return JSON.read(sessionStorage[name]); };
JSON.set = function(name, text) { if (name && text) sessionStorage[name] = text; return JSON; };
JSON.save = function(name, text) { return JSON.set(name, text).get(name); };
JSON.format = function(data, txt, tr) {
	var fn = tr ? function(o) { return render(txt, o, tr); } : function(o) { return format(txt, o); };
	return $.isArray(data) ? data.map(fn).join("") : fn(data);
};
