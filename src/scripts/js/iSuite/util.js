
var ZEROS = "000000000000000";
var B64MT = {
	xls: "data:application/vnd.ms-excel;base64,",
	pdf: "data:application/pdf;base64,",
	txt: "data:text/plain;base64,"
};

//extends String prototype
var sp = String.prototype;
sp.ltrChunk = function(size) {
	var result = []; //parts container
	for (var i = 0; i < this.length; i += size)
		result.push(this.substr(i, size));
	return result;
};

sp.rtlChunk = function(size) {
	var result = []; //parts container
	for (var i = this.length; i > size; i -= size)
		result.unshift(this.substr(i - size, size));
	(i > 0) && result.unshift(this.substr(0, i));
	return result;
};

sp.positions = function(str) {
	var result = [];
	for (var i = 0; i < this.length; i++) {
		i = this.indexOf(str, i);
		if (i < 0) return result;
		result.push(i);
	}
	return result;
};

sp.ilike = function(str) { return ilike(this, str); };
sp.lpad = function(len) { return len ? (ZEROS + this).substr(len * -1) : this; };
sp.rpad = function(len) { return len ? (this + ZEROS).substr(0, len) : this; };
sp.rput = function(len) { return (len > this.length) ? (this + " ".repeat(len - this.length)) : this; };
sp.equal = function(str) { return (this.toLowerCase() == str.toLowerCase()); };
sp.prefix = function(str) { return this.startsWith(str) ? this : (str + this); };
sp.suffix = function(str) { return this.endsWith(str) ? this : (this + str); };
sp.utf8ToB64 = function() { return window.btoa(unescape(encodeURIComponent(this))); };
sp.b64ToUtf8 = function() { return decodeURIComponent(escape(window.atob(this))); };
sp.iIndexOf = function(str) { return iiOf(this, str); };
sp.prevIndexOf = function(str, i) { return prevIndexOf(this, str, i); };
sp.insertAt = function(i, str) { return this.substr(0, i) + str + this.substr(i); };
sp.replaceAt = function(i, n, str) { return (i < 0) ? this : this.substr(0, i) + str + this.substr(i + n); };
sp.replaceLast = function(find, str) { return this.replaceAt(this.lastIndexOf(find), find.length, str); };
sp.replaceAll = function(find, str) { return replaceAll(this, find, str); };
sp.wrapAt = function(i, n, open, close) { return (i < 0) ? this : this.insertAt(i, open).insertAt(i + open.length + n, close); };
sp.iwrap = function(str, open, close) { return this.wrapAt(iiOf(this, str), str.length, open, close); };
sp.slices = function(sizes) { return slices(this, sizes); };
sp.chunk = function() { return this.slices(Array.prototype.slice.call(arguments)); };
sp.minify = function() { return this.trim().replace(/\s{2}/g, ""); };
sp.words = function() { return this.trim().split(/\s+/); };
sp.lines = function() { return this.trim().split(/[\n\r]+/); };
sp.count = function(str) { return this.split(str).length - 1; };
sp.format = function(obj) { return format(this, obj); };
sp.toFirstCase = function() { return ucFirst(this); };
sp.toTitleCase = function() { return this.words().map(ucFirst).join(" "); };
sp.toDate = function() { return Date.build(this.chunk(4, 2, 2, 2, 2, 2, 3)); };
sp.toDateTime = function() { return Date.dpIso(this); };
sp.dpLatin = function() { return Date.build(this.split(/\D+/).swap(0, 2)); };
sp.dfLatin = function() { return this.toDateTime().latin(); }; //return String latin re-formated
sp.npLatin = function() { return this.toNumber(","); }; //return Number object from latin String
sp.nfLatin = function() { return this.toNumber().latin(); }; //return String latin re-formated
sp.toNumber = function(d, n) {
	if (this == "") return 0;
	n = isNaN(n) ? 2 : n; //default 2 decimals
	var separator = this.lastIndexOf(d || ".");
	var sign = (this.charAt(0) == "-") ? "-" : "";
	if (separator < 0)
		return parseFloat(sign + this.replace(/\D+/g, ""));
	var decimal = "." + this.substr(separator + 1, n); //decimal part
	return parseFloat(sign + this.substr(0, separator).replace(/\D+/g, "") + decimal);
};

//extends Array prototype
var ap = Array.prototype;
ap.each = function(callback) { this.forEach(callback); return this; };
ap.put = function() { this.push.apply(this, arguments); return this; };
ap.merge = function(arr) { arr && this.push.apply(this, arr); return this; };
ap.positions = function(v) { return this.reduce(function(a, e, i) { return (e == v) ? a.put(i) : a; }, []); };
ap.combine = function(arr, obj) { return this.reduce(function(o, k, i) { return oSet(o, k, arr[i]); }, obj || {}); };
ap.olike = function(obj, val) { return this.some(function(k) { return ilike("" + obj[k], val); }); };
ap.unique = function() { return this.filter(function(e, i, a) { return a.indexOf(e) == i; }); };
ap.intersect = function(arr) { return this.filter(function(e) { return arr.indexOf(e) > -1; }); };
ap.multisort = function(columns, orderby) { return this.sort(function(a, b) { return multisort(a, b, columns, orderby); }); };
ap.shuffle = function() { return this.sort(function() { return 0.5 - Math.random(); }); };
ap.swap = function(a, b) { var aux = this[a]; this[a] = this[b]; this[b] = aux; return this; };
ap.remove = function(i, n) { return extract(this, i, n); };
ap.reset = function() { return this.remove(0, this.length); };
ap.last = function() { return this[this.length - 1]; };
ap.pull = function() { return pull(this, -1, 1); };

//extends Number prototype
var np = Number.prototype;
np.lpad = function(len) { return this.toString().lpad(len); };
np.rpad = function(len) { return this.toString().rpad(len); };
np.round = function(d) { d = isNaN(d) ? 2 : d; return +(Math.round(this + "e" + d) + "e-" + d); };
np.range = function(min, max) { return Math.min(Math.max(this, min), max); };
np.latin = function(d) { return this.format(".", ",", d); };
np.format = function(s, d, n) {
	n = isNaN(n) ? 2 : n; //default 2 decimals
	var parts = this.round(n).toString().split(".");
	var whole = parts.shift(); //extract whole part
	var decimal = parts.shift() || ""; //decimal part
	var sign = (this < 0) ? "-" : ""; //sign char +/-
	whole = sign ? whole.substr(1) : whole;
	decimal = (d && (n > 0)) ? (d + decimal.rpad(n)) : "";
	return sign + whole.rtlChunk(3).join(s) + decimal;
};

//extends Math functions
Math.rand = function(min, max) { return Math.random() * (max - min) + min; };
Math.randInt = function(min, max) { return Math.floor(Math.rand(min, max)); };
Math.randTime = function(d1, d2) { return Math.randInt(d1.getTime(), d2.getTime()); };
Math.randDate = function(d1, d2) { return new Date(Math.randTime(d1, d2)); };

function oSet(n,t,r){return n[t]=r,n}
function oCopy(n,t,r){return oSet(n,r,n[t])}

//funciones anonimas de traduccion de datos
function toDate(str) { return str && str.toDateTime(); }; //english format string to date
function dpLatin(str) { return str && str.dpLatin(); }; //latin format string to date
function dfLatin(date) { return Date.valid(date) ? date.latin() : date; }; //date to latin format string
function toNumber(str) { return str && str.toNumber(); }; //english format string to number
function npLatin(str) { return str && str.npLatin(); }; //latin format string to number
function nfLatin(num) { //number to latin format string
	var aux = parseFloat(num);
	return isNaN(aux) ? num : aux.latin();
};

//functions to build ajax calls from DOM events
function xhrerr(xhr) { $(".mbox").mbError(xhr.responseText || "Error en la llamada"); };
function link(url, data, fn, dt) { return ajax({ url: url, data: data, success: fn, dataType: dt }); };
function aimg(elem) { return link(elem.href, null, function(data) { $(elem.target).attr("src", data); }); };
function json(url, data, fn) { return link(url, data, fn, "json"); };
function ajax(opts) { //standard function to ajax callings
	var box = $(".ibox").ibOpen();
	opts.type = opts.type || "get";
	opts.dataType = opts.dataType || "html";
	opts.error = opts.error || xhrerr;
	//making the request and return xhr object for assign multiple handlers
	return $.ajax(opts).always(function() { box.ibClose(); }); //close modal
};

//functions para la gestion de mensajes de primefaces
function keyRename(o, p) { Object.keys(o).forEach(function(k) { o[k.prefix(p)] = o[k]; }); return o; };

//DOM is fully loaded
$(function() {
	//tabs handler
	$("a[href^='#tab-']").click(function() {
		var id = this.href.substr(this.href.lastIndexOf("#"));
		var i = +id.substr(id.lastIndexOf("-") + 1) - 1; //tab index
		$($("ul.tabs").children().removeClass("active").get(i)).addClass("active");
		var tab = $(".tab-content").removeClass("active").filter(id).addClass("active");
		return !tab.find("[tabindex='" + (tab.attr("auto-focus") || 1) + "']").focus(); //autofocus?
	}).filter("[href='" + location.hash + "']").first().click(); //load tab by url
	//*******************************************************************//

	var up = $(".back-to-top").click(goUp); //inicialize back to top link
	$(window).scroll(function() { ($(this).scrollTop() > 200) ? up.fadeIn(500) : up.fadeOut(500); });
	$("div[name=srvmsg]").mBox({ clearSiblings: 5000 }); //por defecto 5seg. por mensaje
	$("th").css("white-space", "normal");
});
