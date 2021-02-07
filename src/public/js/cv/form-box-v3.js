
(function($) {
	var settings = { //global common config
		primaryKey: "id", //default PK name
		minLength: 3, //min characters to search
		maxResults: 8, //max results to show

		tipNameTag: "span", //text error container
		tipNameClass: "errtip", //text error class
		errNameClass: "err-input", //css style class
		msgs: {}, //view message container

		//RegEx to validators
		RE_DIGITS: /^\d+$/,
		RE_IDLIST: /^\d+(,\d+)*$/,
		RE_MAIL: /\w+[^\s@]+@[^\s@]+\.[^\s@]+/,
		RE_LOGIN: /^[\w!@&#%\$\^\*\)\(\+\.\-]{6,}$/,
		RE_IPv4: /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
		RE_IPv6: /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
		RE_URL: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/,
		/*FILES: [
			"3ds", "aac", "ae", "ai", "aiff", "asp", "au", "avi", "bin", "bmp", "br", "bs", "bup", "c", "cad", "cdr", "cpp", "cr2", "css", "csv",  "dat", 
			"bd", "dbf", "dll", "doc", "docx", "dw", "dwg", "dxf", "exe", "ext", "file", "fla", "gif", "h", "htm", "html", "ico", "indd",  "iso", "jar", 
			"jpeg", "jpg", "js", "json", "jsp", "lr", "m3u", "mdb", "mov", "mp3", "pdf", "php", "pi", "png", "ppt", "pptx", "psd",  "py", "python",  "rar", 
			"raw", "rss", "rtf", "ruby", "sg", "sql", "svg", "tex", "tif", "tiff", "txt", "wmv", "wpg", "xhtml", "xls", "xlsx", "xml", "xps", "zip"
		],*/

		//event handlers
		onLoad: fnVoid,
		onRemove: fnVoid,
		onFilter: fnTrue,
		onSelect: fnVoid,
		onRender: fnVoid,
		onStart: fnTrue,
		onFile: fnTrue,
		onComplete: fnVoid
	};

	//const definitions
	var SEPARATOR = ",";
	var SEPVIEW = ", ";

	function isnum(str) { return !isNaN(str); }; //0 = true
	function fAttr(elem, name) { return floatval($(elem).attr(name)); }; //attr value to number
	function padLength(elem, value) { return Math.max(fAttr(elem, "maxlength") - value.length, 0); }; //min pad length = 0
	function reTest(re, elemval) { //regex test
		try {
			return !elemval || re.test(elemval);
		} catch(e) {}
		return false;
	};

	/**********************************************************/
	/*var dt = {}; //default transformation functions
	dt.lower = function(elemval, attrval, elem) { return attrval ? elemval.toLowerCase() : elemval; };
	dt.upper = function(elemval, attrval, elem) { return attrval ? elemval.toUpperCase() : elemval; };
	dt.prefix = function(elemval, attrval, elem) { return (elemval && elemval.startsWith(attrval)) ? elemval : (attrval + elemval); };
	dt.suffix = function(elemval, attrval, elem) { return (elemval && elemval.endsWith(attrval)) ? elemval : (attrval + elemval); };
	dt.remove = function(elemval, attrval, elem) { return (elemval && attrval) ? elemval.replace(settings[attrval], "") : elemval; };
	dt.replace = function(elemval, attrval, elem) { return (elemval && attrval) ? elemval.replace(settings[attrval], settings[attrval + "-new"]) : elemval; };
	dt.lpad = function(elemval, attrval, elem) { return attrval ? (attrval.repeat(padLength(elem, elemval)) + elemval) : elemval; };
	dt.rpad = function(elemval, attrval, elem) { return attrval ? (elemval + attrval.repeat(padLength(elem, elemval))) : elemval; };
	/**********************************************************/

	/**********************************************************/
	var dv = {}; //default validators functions
	dv.required = function(elemval, attrval, elem) { return !!elem.value; };
	dv.minlength = function(elemval, attrval, elem) { return !elem.value || (floatval(attrval) <= fnSize(elem.value)); };
	dv.maxlength = function(elemval, attrval, elem) { return !elem.value || (floatval(attrval) >= fnSize(elem.value)); };

	dv.regex = function(elemval, attrval, elem) { return reTest(settings[attrval], elemval); };
	dv.email = function(elemval, attrval, elem) { return reTest(settings.RE_MAIL, elemval); };
	dv.digits = function(elemval, attrval, elem) { return reTest(settings.RE_DIGITS, elemval); };
	dv.idlist = function(elemval, attrval, elem) { return reTest(settings.RE_IDLIST, elemval); };
	dv.array = function(elemval, attrval) { return (elemval && attrval) ? Array.isArray(elemval) : true; }

	dv.hasval = function(elemval, attrval, elem) { return !elemval || $(attrval).val(); };
	dv.equalto = function(elemval, attrval, elem) { return !elemval || (elemval == $(attrval).val()); };

	dv.number = function(elemval, attrval, elem) { return !elem.value || isnum(elemval); };
	dv.min = function(elemval, attrval, elem) { return (elem.value && attrval) ? (isnum(attrval) && isnum(elemval) && (floatval(attrval) <= elemval)) : true; };
	dv.max = function(elemval, attrval, elem) { return (elem.value && attrval) ? (isnum(attrval) && isnum(elemval) && (floatval(attrval) >= elemval)) : true; };
	dv.range = function(elemval, attrval, elem) {
		if (!elem.value || !attrval)
			return true; //empty range
		var range = attrval.split(SEPARATOR).filter(isnum).map(parseFloat);
		return ((range.length===2) && isnum(elemval) && between(elemval, range[0], range[1]));
	};

	dv.date = function(elemval, attrval, elem) { return (elemval && attrval) ? Date.valid(elemval) : true; };
	dv.mindate = function(elemval, attrval, elem) {
		if (!elemval || !attrval)
			return true; //not min limit
		var min = new Date(isnum(attrval) ? +attrval : attrval);
		return Date.valid(min) && dv.date(elemval, attrval, elem) && (min <= elemval);
	};
	dv.maxdate = function(elemval, attrval, elem) {
		if (!elemval || !attrval)
			return true; //not max limit
		var max = new Date(isnum(attrval) ? +attrval : attrval);
		return Date.valid(max) && dv.date(elemval, attrval, elem) && (max >= elemval);
	};
	dv.time = function(elemval, attrval, elem) {
		if (!elemval || !attrval)
			return true; //empty time
		var time = elemval.split(":").filter(isnum).map(parseFloat);
		return (time.length===2 && between(time[0], 0, 23) && between(time[1], 0, 59))
				|| (time.length===3 && between(time[0], 0, 23) && between(time[1], 0, 59) && between(time[2], 0, 59));
	};
	/**********************************************************/

	/******************* form-box-v3 *******************/
	var tabs, tabh, fields; //common global vars
	var csserr = settings.tipNameTag + "." + settings.tipNameClass; //errbox selector
	tabs = tabh = fields = $(); //init lists

	function fnJoin(arr) { return arr.join(SEPARATOR); }; //join values
	function eqSize(a, b) { return a.length == b.length; }; //check lengths
	//function fnSubmit() { fields.submitData(); }

	$.fn.fBox = function(opts) { //init forms config
		$.extend(opts, $.extend(settings, opts)); //opts == settings
		opts.validators = $.extend(dv, opts.validators); //fn for validation
		csserr = opts.tipNameTag + "." + opts.tipNameClass.split(/\s+/g).join("."); //error selector
		//show server messages, set event handler for changed input, get form fields, re-style values and set focus
		fields = this.inputs().clean();//.seterr("onload").change(function() { opts.changed = true; }).initData().setFocus();
		return this; //.submit(fnSubmit); //set submit handler
	};

	var oTIP = {};
	$.fn.seterr = function(msg) {
		var j = 0; //index error
		msg = msg || settings.msgs.default || "";
		return this.each(function(i, elem) {
			var jqel = $(elem); //jQuery element
			var aux = isstr(msg) ? msg : msg[elem.id]; //a message / messages
			aux = jqel.attr("msg-" + aux) || settings.msgs[aux] || aux;
			if (fnIO(aux, " ") > 0) { //exists message to show
				j++ || viewtab(jqel); //focus on first error
				var fnStyle = jqel.data("style");
				oTIP.minlength = jqel.attr("minlength");
				oTIP.maxlength = jqel.attr("maxlength");
				oTIP.min = apply(fAttr(elem, "min"), fnStyle);
				oTIP.max = apply(fAttr(elem, "max"), fnStyle);
				oTIP.mindate = apply(jqel.attr("mindate"), fnStyle);
				oTIP.maxdate = apply(jqel.attr("maxdate"), fnStyle);
				var box = jqel.addClass(settings.errNameClass).errbox();
				box = box.length ? box.show() : jqel.after(newElem(settings.tipNameTag)).next();
				box.addClass(settings.tipNameClass).html(format(aux, oTIP)); //add text and class error to the tooltip
			}
		});
	};

	//$.fn.fields = function() { fields = this; return this; }; //update field list
	$.fn.errbox = function() { return this.siblings(csserr); }; //tooltip error list
	$.fn.inputs = function() { return this.find("input[type!=file],textarea,select"); }; //get sub-inputs
	$.fn.sortid = function() { return this.sort(function(a, b) { return cmp(a.id, b.id) }); }; //sort by id
	$.fn.isset = function(key) { return this.filter(function() { return isset($(this).data(key)); }); };
	$.fn.initData = function() { return this.each(function(i, elem) { elem.value = apply(val(elem), $(elem).data("init")); }); };
	$.fn.submitData = function() { this.isset("submit").css("color", "silver").each(function(i, elem) { elem.value = apply(val(elem), $(elem).data("submit")); }); return this; }
	$.fn.filterData = function(key, val) { return this.filter(function() { return ($(this).data(key) == val); }); };
	$.fn.setFocus = function() { this.filter(":visible:not([readonly])").first().focus(); return this; }; //set focus on first editable input
	$.fn.clean = function() { this.removeClass(settings.errNameClass).errbox().hide(); return this.setFocus(); }; //clean inputs and focus
	$.fn.flush = function() { fields.clean().mbFlush(); return this; }; //hide all messages
	$.fn.showif = function(ok) { return ok ? this.show() : this.hide(); }; //show/hide elements
	$.fn.view = function(mask) { return this.each(function(i, el) { $(el).showif((mask >> i) & 1); }); }; //show/hide each element
	$.fn.showon = function(list, val) { return this.change(function() { list.showif(this.value == val); }).change(); };
	$.fn.classif = function(ok, cls) { return ok ? this.addClass(cls) : this.removeClass(cls); };
	$.fn.setClass = function(mask, cls) { return this.each(function(i, el) { $(el).classif((mask >> i) & 1, cls); }); };
	$.fn.mask = function(mask) { return this.setClass(~mask, "hide"); };
	//$.fn.equal = function(data) { return this.get().every(function(elem) { return !val(elem) || (val(elem) == data[elem.id]); }); };
	//$.fn.ilike = function(data) { return this.get().every(function(elem) { return !val(elem) || ilike(data[elem.id], val(elem)); }); };
	//selected = if selected option is visible => not change, but if it is hidden select first not .hide option (options are hidden)
	$.fn.optval = function(val) { return this.children("option[value='" + val + "']"); }; //get selected text
	$.fn.selected = function(mask) {
		var options = this.children().mask(mask);
		if (!this.val() || this.optval(this.val()).hasClass("hide"))
			this.val(options.not(".hide").val());
		return this;
	};

	//$.fn.required = function(mask) { return this.each(function(i, el) { $(el).inputs().attr("required", !!((mask >> i) & 1)); }); };
	function fnId() { return "_" + Math.random().toString(36).substr(2, 9); };
	$.fn.required = function(mask) {
		var self = this; //self instance
		return self.each(function(i, el) {
			el.id = el.id || fnId(); //id required, if empty => generate unique
			var arr = self.data(el.id) || $("[required]", el); //get required fields
			arr.attr("required", !!((mask >> i) & 1)); //IMPORTANT! required == boolean type
			self.data(el.id, arr); //save required fields only
		});
	};
	$.fn.unrequired = function() { return this.attr("required", false).val("").clean(); }; //required = false and clean data
	$.fn.failures = function() { return this.filter("." + settings.errNameClass); };
	$.fn.isOk = function() { return (this.failures().length == 0); };
	$.fn.valid = function() { return fields.validate(); };
	$.fn.validate = function() {
		this.clean().each(function(i, elem) {
			var ok = true; //valid input indicator
			var size = elem.attributes.length; //size
			//read input value as string without spaces
			var value = apply(val(elem), $(elem).data("parse"));
			for (var i = 0; (i < size) && ok; i++) {
				var item = elem.attributes[i]; //attr
				var fn = dv[item.name] || fnTrue;
				//check for an error, set indicator and stop input validators
				ok = fn(value, val(item), elem) || !$(elem).seterr(item.name);
			}
			//if elem is ok => call validation function (action transform)
			elem.value = apply(elem, (ok && settings[elem.id + "-ok"]) || val);
		});
		//valid or autofocus on first error
		var field = this.failures();
		return !field.length || !viewtab(field);
	};
	/*$.fn.send = function(opts) {
		var oAux = $.extend({}, opts); //specific options
		var form = this.closest("form"); //form container
		oAux.url = oAux.url || form.attr("action"); //resource
		oAux.type = oAux.type || form.attr("method") || "get"; //request type
		oAux.dataType = oAux.dataType || "json"; //what kind of response to expect
		if (oAux.type != "post")
			return $.ajax(oAux); //call to server
		//fnSubmit(); //simule onsubmit event before ajax send
		oAux.data = new FormData(form[0]); //preload form data in client (files, dates, ...)
		fields.isset("submit").css("color", "black").initData(); //re-init values
		oAux.contentType = oAux.processData = false; //not to process the data
		return $.ajax(oAux); //send ajax call to server
	};*/

	//*********************** tabs handler functions ********************//
	function indextab(id) { return id ? +id.substr(id.lastIndexOf("-") + 1) : 0; }; //get index from id
	function viewtab(field) { return showtab(field, indextab(field.closest(".tab-content").attr("id"))); };
	function gotab(i) { return showtab($(tabs[i]).inputs(), i); };
	function showtab(field, i) {
		tabs.setClass(1<<i, "active"); //exists tabas
		tabh.setClass(1<<i, "active"); //exists tab header
		return field.setFocus(); //set focus on first
	};
	$.fn.tabs = function(mask) { //form tabs
		tabs = this;
		var nav = "a[href^='#tab-']";
		tabh = this.find("ul.tabs").children().view(mask);
		tabh.find(nav).unbind("click").click(function() {
			return !gotab(indextab(this.href));
		});
		tabs.each(function(i, tab) { //tabs
			$(nav, tab).unbind("click").click(function() {
				let i = indextab(this.href);
				if (i > indextab(tab.id))
					while (!((mask >> i) & 1) && (i < 100)) i++;
				else
					while (!((mask >> i) & 1) && (i > 0)) i--;
				return (i < 100) && !gotab(i);
			});
		});
		return this;
	};
	$.fn.gotab = function(i) { gotab(i); return this; };
	//*******************************************************************//

	/*$.fn.counter = function() { //textarea characters counters
		function fn() { $("#counter", this.parentNode).text(Math.abs(fAttr(this, "maxlength") - this.value.length)); };
		return this.each(fn).unbind("keyup", fn).keyup(fn);
	};
	$.fn.multival = function(group) {
		var self = this; //self instance
		var values = split(self.val(), SEPARATOR); //split values
		group = group.sortid().each(function(i, el) { el.value = values[i] || el.value; }); //order and set values
		group.change(function() { self.val(fnJoin(group.get().map(val))); }); //update main
		return self;
	};*/

	$.fn.cblist = function(group) {
		var self = this; //self instance
		group.change(function() { //checkboxes subgroup change event
			var aux = group.filter(":checked").get(); //checked
			self.prop("checked", eqSize(group, aux));
			self.val(fnJoin(aux.map(val))); //value list
		});
		return self.prop("checked", false).click(function() {
			group.prop("checked", $(this).prop("checked")).first().change();
		});
	};
	$.fn.cbbin = function(group) {
		var self = this; //self instance
		var initval = self.val() || ""; //used when reset event
		group.change(function() { //checkboxes subgroup change event
			self.val(group.get().reduce(function(r, e, i) { return (r | (e.checked << i)); }, 0)); //binary value
			self.prop("checked", eqSize(group, group.filter(":checked")));
		});
		function fnLoad(value) {
			group.each(function(i, el) { el.checked = !!((value >> i) & 1); });
			self.attr("type", "checkbox").prop("checked", (group.length > 0) && eqSize(group, group.filter(":checked")));
			return value;
		};

		return self.data({
			init: fnLoad, style: fnLoad,
			reset: function() { return initval; },
			submit: function() { return self.val() && self.attr("type", "hidden").val(); }
		}).click(function() {
			group.prop("checked", $(this).prop("checked")).first().change();
		});
	};

	$.fn.reset = function() {
		settings.changed = false; //change indicator
		this.closest("form").trigger("reset"); //1. reset all value inputs
		fields.each(function(i, elem) { elem.value = apply(val(elem), $(elem).data("reset")); }).initData(); //2. call reset function and re-init values
		return this.flush(); //hides messages
	};
	$.fn.import = function(data) {
		return this.each(function(i, elem) { elem.value = apply(data[elem.id], $(elem).data("style")) || elem.value; }); //1.- load all inputs
	};
	$.fn.export = function(data) {
		data = data || {}; //data container
		this.each(function(i, elem) { data[elem.id] = apply(val(elem), $(elem).data("parse")); }); //2.- load all data
		return data;
	};

	//autocomplete functions
	$.fn.acLoad = function(data) { return this.each(function(i, elem) { apply(data, $(elem).data("load")); }); };
	$.fn.acVal = function(values) { return this.each(function(i, elem) { elem.value = apply(values, $(elem).data("style")); }); };
	$.fn.acGet = function(i) { return $(this).data("get")(i); };
	$.fn.ac = function(opts) {
		$.extend(opts, $.extend({}, settings, opts));
		return this.each(function(i, elem) {
			var jqel = $(elem); //jQuery element
			var terms, values, items; //containers
			var term, n1; //search term and indexes

			function init() { terms.splice(0); values.splice(0); items.splice(0); return opts; }; //init containers
			function popval() { values.pop(); items.pop(); return opts; }; //extract last values
			function setval(id, item) { values.push(+id); items.push(item); return opts; }; //add values
			function fnMultiSize() { return terms.reduce(function(l, t) { return l + t.length + 2}, 0); }; //get lables length
			function getTerm(term) { return (opts.multiple && term) ? term.substr(fnMultiSize()) : term; }; //get last term/label
			function fnRemove(i) { extract(terms, i, 1); extract(values, i, 1); extract(items, i, 1); return opts; }; //add values
			function getval() { return (opts.multiple && terms.length) ? (terms.join(SEPVIEW) + SEPVIEW) : terms[0]; }; //get value
			function getIndexOf(start) { n1 = 0; return terms.findIndex(function(term) { n1 += (term.length + 2); return (start < n1); }); };
			function setSelection(start, end) { elem.selectionStart = start; elem.selectionEnd = end; };
			function selectIndex(i) { setSelection(n1 - fnSize(terms[i]) - 2, n1 - 2); };
			function selectChar(ev) {
				var n2 = fnSize(elem.value);
				if (opts.multiple) {
					var start = range(Math.min(elem.selectionStart, elem.selectionEnd), 0, n2);
					(start < n2) && selectIndex(getIndexOf(start));
				}
				else
					setSelection(0, n2);
				ev.preventDefault();
			};

			opts.flush = function() { jqel.clean().val(""); return init(); }; //clear values
			opts.load = function(data) { if (data) opts.data = data; return opts; }; //set new data
			opts.find = function(id) { return opts.data.find(function(row) { return (row[opts.primaryKey] == id); }); };
			opts.get = function(i) { return opts.multival ? (isNaN(i) ? items : items[i]) : items[0]; };

			opts.readonly = jqel.is("[readonly]"); //readonly attribute
			if (!opts.readonly) { //is editable or simple input?
				//add format handlers
				opts.submit = function() { return fnJoin(values); };
				opts.parse = function() { return values; };
				opts.style = function(idList) {
					init(); //initialize containers
					var aux = split(idList, SEPARATOR) || values;
					aux.forEach(function(id) {
						var item = id && opts.find(id); //get item from data
						//set init values and after get formatted label to view in input
						var label = item && setval(id, item).onSelect(item, opts.data, elem);
						label ? terms.push(label) : popval(); //update label or extract last values
					});
					return getval() || jqel.val();
				};
				opts.init = opts.style;
				jqel.data(opts); //set data

				//add autocomplete handlers
				opts.source = function(req, res) {
					term = getTerm(req.term); //render term
					function fnSource(data) { //data source
						opts.data = data || opts.data;
						var data = distinct(opts.data, opts.uk); //unique key?
						res(data.filter(function(row, i) { //filter items
							return ((values.indexOf(row[opts.primaryKey]) < 0) //pk unique in selection
									&& opts.onFilter(row, term, i, data)); //is showed?
						}).slice(0, opts.maxResults));
					};
					if (opts.onSource && (fnSize(term) >= opts.minLength))
						opts.onSource(fnSource, opts); //load server matches
					else
						fnSource(); //data cached
				};
				opts.search = function() { return fnSize(getTerm(jqel.val())) >= opts.minLength; }; //custom minLength
				opts.focus = function(ev, ui) { return false; }; //prevent value inserted on focus
				opts.select = function(ev, ui) { //on-select handler
					if (ui.item) { //set init values and after get formatted label to view in input
						if (!opts.multiple) { popval(); terms.pop(); } //if simple value => pop pre-selected value
						var label = setval(ui.item[opts.primaryKey], ui.item).onSelect(ui.item, opts.data, elem); //add new val
						label ? terms.push(label) : popval(); //update label or extract last values
						jqel.val(getval());
					}
					return false;
				};
				/*********************************/

				jqel.click(selectChar).dblclick(selectChar).keydown(function(ev) { //input events
					var last = opts.multiple ? fnMultiSize()-2 : fnSize(elem.value);
					if (ev.keyCode === 9) //TAB key code
						jqel.autocomplete("instance").menu.active && ev.preventDefault(); //if menu is active stop tab
					else if (!values.length || (elem.selectionStart > (last + 2))) {} //default action in last term
					else if (((ev.keyCode == 8) && (elem.selectionStart >= last)) //BACKSPACE key code
							|| ((ev.keyCode == 37) && (elem.selectionStart <= (last + 2))) //LEFT key code
							|| (ev.keyCode == 38)) { //UP key code
						selectIndex(getIndexOf(elem.selectionStart - 2));
						ev.preventDefault();
					}
					else if (((ev.keyCode == 39) || (ev.keyCode == 40)) && (elem.selectionEnd == last)) //RIGHT/DOWN key code
						elem.selectionStart = last + 1; //last + right + 1
					else if (((ev.keyCode == 39) || (ev.keyCode == 40)) && (elem.selectionStart < last)) { //RIGHT/DOWN key code
						elem.selectionStart = elem.selectionEnd + 3; //SEPVIEW.length = 2 + right
						selectChar(ev);
					}
					else if (((ev.keyCode == 8) || (ev.keyCode == 46))) { //BACKSPACE or DELETE key code
						fnRemove(getIndexOf(elem.selectionStart)); //remove
						jqel.val(getval()); //update value
						opts.onRemove(items, elem); //call remove handler
						ev.preventDefault();
					}
					else if (ev.keyCode >= 48) { //0 key code = 48
						if ((elem.selectionStart == 0) && (elem.selectionEnd >= last))
							opts.flush().onRemove(items, elem); //remove all and call remove handler
						else { //others chars [a-zA-Z0-9...]
							setSelection(last+2, last+2); //go last position
							(ev.keyCode == 188) && ev.preventDefault(); //COMMA key code
						}
					}
				}).autocomplete(opts).autocomplete("instance")._renderItem = function(ul, item) {
					var label = opts.onRender(item, term, ul) || item.label || "";
					return $("<li></li>").append("<div>" + label + "</div>").appendTo(ul);
				};
			}

			//init containers and execute onLoad handler
			terms = []; values = []; items = [];
			opts.data = opts.data || JSON.read(jqel.prev("#tb-" + elem.id).text()) || [];
			opts.data = opts.onLoad(opts.data) || opts.data; //pre-process data
		});
	};

	var fr = new FileReader(); //object reader
	function fnReader(file) { //encoding type: "ISO-8859-1", "UTF-8", ...
		file.type.startsWith("image/") ? fr.readAsDataURL(file) 
								: settings.encoding ? fr.readAsText(file, settings.encoding)
								: fr.readAsBinaryString(file);
		return file;
	};
	$.fn.freader = function() {
		return this.each(function(i, elem) {
			fr.onload = function(ev) {
				settings.onFile(ev, file); //once for each file
				if (++j < size) //go next file?
					file = fnReader(flist[j]);
				else
					settings.onComplete(flist);
			};
			var j = 0; //index
			var flist = elem.files;
			var size = fnSize(flist);
			//first recursive call
			var file = size && fnReader(flist[j]);
		});
	};

	$.fn.swapAttr = function(a, b) {
		return this.each(function(i, elem) {
			//IMPORTANT! compatibility with old jquery versions:
			$(elem).attr(b); //1.- add and modify attributes
			for (var k in a) { //2.- remove only distincts
				isset(b[k]) || $(elem).removeAttr(k);
			}
		});
	};

	$.fn.clicks = function() {
		var args = arguments;
		return this.click(function(ev) {
			for (var i = 0; i < args.length; i++) { //arguments iterator
				if (!args[i](this, ev)) return false; //call validator
			}
			return true;
		});
	};
}(jQuery));
