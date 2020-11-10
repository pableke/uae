
//extends Date class and prototype
var sysdate = new Date(); //global sysdate
function lpad(val) { return (val < 10) ? ("0" + val) : val; }; //always 2 digits
function isLeapYear(year) { return ((year & 3) == 0) && (((year % 25) != 0) || ((year & 15) == 0)); }; //año bisiesto?
function daysInMonth(y, m) { return Date.daysInMonths[m] + ((m == 1) && isLeapYear(y)); };
function dayOfYear(y, m, d) { return Date.daysInMonths.slice(0, m).reduce(acum, d+((m > 1) && isLeapYear(y))); };
function isDate(str) { return /^\d{4}\D\d{1,2}\D\d{1,2}/.test(str); }; //valid datetime string
function isLatinDate(str) { return between(fnIO(str, "/"), 1, 2) && between(str.lastIndexOf("/"), 3, 5); };
function splitDate(str) { return split(str, /\D+/) || []; };
function parseDate(str) {
	var parts = splitDate(str).map(intval);
	if (parts.length < 3)
		return str && new Date(isNaN(str) ? Date.parse(str) : +str);
	isLatinDate(str) && swap(parts, 0, 2);
	var n = daysInMonth(parts[0], parts[1] - 1);
	return between(parts[1], 1, 12) && between(parts[2], 1, n) && Date.build(parts);
};

var toDate, dpLatin, isLatin; //sinonyms
toDate = dpLatin = parseDate; //string format to date
isLatin = isLatinDate; //valid latin datetime string

//autocomplete helper functions
function dateHelper(val) { return val && val.replace(/^(\d{4})(\d+)$/g, "$1-$2").replace(/^(\d{4}\-\d\d)(\d+)$/g, "$1-$2").replace(/[^\d\-]/g, ""); }
function dhLatin(val) { return val && val.replace(/^(\d\d)(\d+)$/g, "$1/$2").replace(/^(\d\d\/\d\d)(\d+)$/g, "$1/$2").replace(/[^\d\/]/g, ""); }
function timeHelper(val) { return val && val.replace(/(\d\d)(\d+)$/g, "$1:$2").replace(/[^\d\:]/g, ""); }
function joinDate(parts, sep) { return parts.map(function(p) { return lpad(intval(p)); }).join(sep || "-"); }; //join date parts
//function fmtDate(str, sep) { return joinDate(splitDate(str), sep); };
function fmtLatinDate(str) {
	if (!str) return str; //empty value
	var parts = splitDate(str); //separe date
	if (fnSize(parts[2]) < 3) //autocomplete year as string
		parts[2] = "" + sysdate.getCentury() + lpad(intval(parts[2])); //string year=yyyy
	return joinDate(parts, "/");
};
function fmtTime(str) {
	if (!str) return str; //empty value
	var parts = splitDate(str); //separe time
	parts[1] = (fnSize(parts[1]) < 1) ? "0" : parts[1]; //autocomplete minutes
	//if ((parts.length > 2) && fnSize(parts[2]) < 1) parts[2] = "0"; //autocomplete seconds
	return joinDate(parts, ":");
}
function dfLatin(date) { //date to latin format string
	date = (date && isstr(date)) ? toDate(date) : date; //date value
	return Date.valid(date) ? date.latin() : date; //is valid date?
}
function dtLatin(date) { //date to latin format string
	date = (date && isstr(date)) ? toDate(date) : date; //date value
	return Date.valid(date) ? date.dtLatin() : date; //is valid date?
}

Date.valid = function(d) { return d && (d instanceof Date) && d.valid && d.valid(); };
Date.load = function(flags) { return new Date(flags.yyyy, flags.m - 1, flags.d, flags.h, flags.M, flags.s, flags.ms); };
Date.build = function(parts) { return new Date(+parts[0], +parts[1] - 1, +parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0, parts[6] || 0); };
Date.dpIso = function(str) { return Date.build(splitDate(str)); };

var dp = Date.prototype;
dp.toArray = function() {
	return [this.getFullYear(), lpad(this.getMonth() + 1), lpad(this.getDate()), 
			lpad(this.getHours()), lpad(this.getMinutes()), lpad(this.getSeconds()), 
			this.getMilliseconds()];
};
dp.toObject = function(l) {
	l = l || lang(); //browser lang
	var D = this.getDay();
	var Y = this.getFullYear().toString();
	var dl = Date.langs[l] || Date.langs[l.substr(0, 2)] || Date.langs.en; //default language
	var flags = { yyyy: +Y, y: +Y.substr(0, 2), yy: +Y.substr(2, 2), m: this.getMonth(), d: this.getDate() };
	flags.mmm = dl.monthNamesShort[flags.m]; flags.mmmm = dl.monthNames[flags.m]; flags.mm = lpad(++flags.m);
	flags.ddd = dl.dayNamesShort[D]; flags.dddd = dl.dayNames[D]; flags.dd = lpad(flags.d);
	flags.h = this.getHours(); flags.hh = lpad(flags.h); flags.M = this.getMinutes(); flags.MM = lpad(flags.M);
	flags.s = this.getSeconds(); flags.ss = lpad(flags.s); flags.ms = this.getMilliseconds();
		flags.t = (flags.h < 12) ? "a" : "p"; flags.tt = flags.t + "m";
	return flags;
};
dp.getCentury = function() { return intval(this.getFullYear() / 100); }; //ej: 20
dp.startYear = function() { return new Date(this.getFullYear(), 0, 1); }; //01/01/xxxx
dp.startMonth = function() { return new Date(this.getFullYear(), this.getMonth(), 1); };
dp.daysInMonth = function() { return daysInMonth(this.getFullYear(), this.getMonth()); };
dp.dayOfYear = function() { return dayOfYear(this.getFullYear(), this.getMonth(), this.getDate()); };
dp.daysInYear = function() { return isLeapYear(this.getFullYear()) ? 366 : 365; };
dp.weekOfYear = function() { return this.weeks(this.startYear()); };
dp.weekOfMonth = function() { return this.weekOfYear() - this.startMonth().weekOfYear() + 1; };

dp.valid = function() { return !isNaN(this.getTime()); };
dp.trunc = function() { this.setHours(0, 0, 0, 0); return this; };
dp.format = function(mask) { return format(mask, this.toObject()); };
dp.between = function(d1, d2) { return (d1 <= this) && (this <= d2); };
dp.min = function(date) { return (date && (date < this)) ? date : this; };
dp.max = function(date) { return (date && (date > this)) ? date : this; };
dp.in = function(d1, d2) { return (!d1 && !d2) ? true : !d1 ? (this <= d2) : !d2 ? (d1 <= this) : this.between(d1, d2); };
dp.inMonth = function(date) { return (this.getFullYear() == date.getFullYear()) && (this.getMonth() == date.getMonth()); };
dp.days = function(date) { return (Math.abs(this - date)/8.64e7); };
dp.weeks = function(date) { return Math.ceil((this.days(date) + (date.getDay() || 7)) / 7); };
dp.addDate = function(val) { this.setDate(this.getDate() + val); return this; };
dp.addHours = function(val) { this.setHours(this.getHours() + val); return this; };
dp.addMilliseconds = function(val) { this.setMilliseconds(this.getMilliseconds() + val); return this; };

dp.dfMin = function() { return this.format("@yy;@mm;@dd;"); }; //yymmdd
dp.dfMinTime = function() { return this.format("@h;:@MM;"); }; //h:mm
dp.dfShort = function() { return this.format("@yy;-@m;-@d;"); }; //yy-m-d
dp.dfShortTime = function() { return this.format("@h;:@MM; @tt;"); }; //h:mm tt
dp.isoDate = function() { return this.format("@yyyy;-@mm;-@dd;"); }; //yyyy-mm-dd
dp.latin = function() { return this.format("@dd;/@mm;/@yyyy;"); }; //dd/mm/yyyy
dp.dtLatin = function() { return this.format("@dd;/@mm;/@yyyy; @hh;:@MM;:@ss;"); };
dp.dfIso = function() { return this.format("@yyyy;-@mm;-@dd;T@hh;:@MM;:@ss;.@ms;Z"); }; //last "Z" means that the time is UTC
dp.dfFull = function() { return this.format("@dddd;, @mmmm; @d;, @yyyy;"); }; //dddd, mmmm d, yyyy
dp.toJSON = dp.dfIso; //default JSON.stringify call for date format

dp.diff = function(date) {
	date = date || sysdate;
	if (this > date) //swap
		return date.diff(this);
	var result = date.toArray(); //date parts
	var dias = this.daysInMonth() - this.getDate() + date.getDate();
	var ajustes = [0, 12, dias, 24, 60, 60, 1000]; //years, months, days...
	function fnAjustar(result, i, val) {
		result[i] -= val;
		if (result[i] < 0) {
			result[i] += ajustes[i];
			fnAjustar(result, i-1, 1);
		}
	}

	this.toArray().forEach((p, i) => { fnAjustar(result, i, p); });
	return result;
};

dp.fmtdiff = function(mask, date) {
	var parts = this.diff(date);
	var flags = { yyyy: parts[0], yy: parts[0], m: parts[1], d: parts[2] };
	flags.mm = lpad(flags.m); flags.dd = lpad(flags.d);
	flags.h = parts[3]; flags.M = parts[4]; flags.s = parts[5];
	flags.hh = lpad(flags.h); flags.MM = lpad(flags.M);
	flags.ss = lpad(flags.s); flags.ms = parts[6];
	return format(mask, flags);
};

dp.interval = function(timeleft, onTic, onTimeLeft, interval) {
	var date = this; //this = start date
	interval = interval || 1000; //default 1seg.
	var endDate = new Date(this.getTime() + timeleft); //end date.
	var idInterval = setInterval(function() {
		date.addMilliseconds(interval);
		if (!onTic(date, endDate) || (endDate <= date)) {
			clearInterval(idInterval);
			onTimeLeft && onTimeLeft();
		}
	}, interval);
	return this;
};
