
function DOMBox(opts) {
	const self = this; //self instance
	const RE_VAR = /@(\w+);/g; //regexp for vars
	const HTML_DIV = newElem("div"); //div container
	const INPUTS = "input:not([type=file]),textarea,select";

	//default configuration
	opts = Object.assign({
		hideClass: "hide", //css class to display none
		tooltipClass: "err-tip", //text error class
		errInputClass: "err-input", //css input style
		loadingClass: "loading", //loading css

		//Messages
		fadeDuration: 600,
		closeText: "&times;",
		mbWrapperClass: "mbox",
		mboxClass: "mbox-div",
		buttonClose: "mbox-close",
		textClass: "mbox-text",
		iconClass: "mbox-icon",
		okClassName: "mbox-ok",
		okIcon: "&#10004;",
		infoClassName: "mbox-info",
		infoIcon: "&#120154;",
		warnClassName: "mbox-warn",
		warnIcon: "&#9888;",
		errorClassName: "mbox-error",
		errorIcon: "&#10008;"
	}, opts);

	//helpers functions
	function fnTrue() { return true; }
	function intval(val) { return parseInt(val) || 0; }
	function fnSize(str) { return str ? intval(str.length) : 0; } //string o array
	function range(val, min, max) { return Math.max(Math.min(val, max), min); }
	function fnId() { return "_" + Math.random().toString(36).substr(2, 9); }
	function isset(val) { return (typeof val != "undefined") && (val != null); }
	function isstr(val) { return (typeof val === "string") || (val instanceof String); }
	function nvl(val, def) { return isset(val) ? val : def; } //default
	function fnTrim(str) { return isstr(str) ? str.trim() : str; }
	function minify(str) { return str ? str.replace(/\>\s+\</g, "><") : str; }
	function split(str) { str = fnTrim(str); return str ? str.split(/\s+/) : []; } //space separator
	function getVal(elem) { return elem && elem.value; } //get value
	function getHtml(elem) { return fnTrim(elem && elem.innerHTML); } //get html text
	function getText(elem) { return fnTrim(elem && elem.textContent); } //get elem text
	function apply(val, fn) { return (fn && isset(val)) ? fn(val) : val; } //call fn if exists
	function format(str, obj) { return str.replace(RE_VAR, (m, k) => { return nvl(obj[k], m); }); }
	function render(str, obj, tr) { return str.replace(RE_VAR, (m, k) => { return nvl(apply(obj[k], tr[k]), m); }); }
	function toArray(nodelist) { return nodelist ? Array.prototype.slice.call(nodelist) : []; } //faster then Array.from()
	function match(el, selector) { return !selector || el.matches(selector); }
	function isDisplayNone(el) { return el && (el.style.display == "none"); }
	function fnShow(el, style) {
		el.style.display = style || "block";
		el.style.opacity = 1; //util for fade
		return self;
	}

	function getClassSelector(str) { return str ? ("." + split(str).join(".")) : ""; } //dot classes selector
	const TOOLTIP_SELECTOR = getClassSelector(opts.tooltipClass);
	const MB_ERROR_SELECTOR = getClassSelector(opts.errorClassName);

	//extra JSON functions
	JSON.read = function(val) { return val ? JSON.parse(val) : null; }
	JSON.get = function(name) { return JSON.read(sessionStorage[name]); }
	JSON.set = function(name, text) { if (name && text) sessionStorage[name] = text; return JSON; }
	JSON.save = function(name, text) { return JSON.set(name, text).get(name); }
	JSON.format = function(data, txt) { return data.map((row, i) => { row.i = i + 1; return format(txt, row); }).join(""); }
	JSON.render = function(data, txt, tr) { return data.map((row, i) => { row.i = i + 1; return render(txt, row, tr); }).join(""); }
	//extra JSON functions

	this.find = function(selector, el) { return (el || document).querySelector(selector); }
	this.findAll = function(selector, el) { return (el || document).querySelectorAll(selector); }
	this.children = function(el, selector) { return selector ? self.findAll(el, ":scope>" + selector) : el.children; }
	this.filter = function(list, selector) { return toArray(list).filter(el => { return match(el, selector); }); }
	this.not = function(list, selector) { return toArray(list).filter(el => { return !match(el, selector); }); }
	this.delay = function(fn, delay) { window.setTimeout(fn, delay || opts.fadeDuration); return self; }
	this.redir = function(url, target) { url && window.open(url, target || "_blank"); return self; };
	this.each = function(list, fn) { //iterator
		let size = fnSize(list); //max limit
		for (let i = 0; i < size; i++) //IMPORTANT! node-list is alive
			fn(list[i], i); //callback
		return self;
	}
	this.reduce = function(list, fn, value) { //iterator
		let size = fnSize(list); //max limit
		for (let i = 0; i < size; i++) //IMPORTANT! node-list is alive
			value = fn(value, list[i], i); //callback
		return value;
	}

	this.hideElem = function(el) { el && (el.style.display = "none"); return self; }
	this.hideList = function(list) { return self.each(list, self.hideElem); }
	this.hide = function(selector, el) { return self.hideList(self.findAll(selector, el)); }
	this.showElem = function(el, style) { return el ? fnShow(el, style) : self; }
	this.showList = function(list, style) { return self.each(list, el => { fnShow(el, style); }); }
	this.show = function(selector, el, style) { return self.showList(self.findAll(selector, el)); }
	this.toggleElem = function(el, style) { return isDisplayNone(el) ? self.showElem(el, style) : self.hideElem(el); }
	this.toggleList = function(list, style) { return self.each(list, el => { self.toggleElem(el, style); }); }
	this.toggle = function(selector, el, style) { return self.toggleList(self.findAll(selector, el), style); } //toggle style
	this.viewElem = function(el, mask, style) { return mask ? self.showElem(el, style) : self.hideElem(el); } //show/hide each element
	this.viewList = function(list, mask, style) { return self.each(list, (el, i) => { self.viewElem(el, (mask >> i) & 1, style); }); } //show/hide each element
	this.view = function(selector, el, mask) { return self.viewList(self.findAll(selector, el), mask); } //show/hide each element

	this.cssElem = function(el, name, value) { el && (el.style[name] = value); return self; } //update a style
	this.cssList = function(list, name, value) { return self.each(list, el => { self.cssElem(el, name, value); }); } //update a style
	this.css = function(selector, el, name, value) { return self.cssList(self.findAll(elector, el), name, value); } //set attribute value
	this.visible = function(el) { return el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
	this.styles = function(el) { return window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle; } //calculated styles readonly

	this.attrElem = function(el, name, value) { el && el.setAttribute(name, value); return self; } //set attribute value
	this.attrList = function(list, name, value) { return self.each(list, el => { self.attrElem(el, name, value); }); } //set attribute value
	this.attr = function(selector, el, name, value) { return self.attrList(self.findAll(elector, el), name, value); } //set attribute value
	this.delAttrElem = function(el, name) { el && el.removeAttribute(name); return self; } //remove attribute
	this.delAttrList = function(list, name) { return self.each(list, el => { self.delAttrElem(el, name); }); } //remove attribute
	this.delAttr = function(selector, el, name) { return self.delAttrList(self.findAll(elector, el), name); } //remove attribute

	this.valElem = function(el, value) { el && (el.value = value); return self; } //set value to an element
	this.valList = function(list, value) { return self.each(list, el => { self.valElem(el, value); }); } //set value to all elements
	this.val = function(selector, el, value) { return self.valList(self.findAll(selector, el), value); } //set value to all elements
	this.htmlElem = function(el, txt) { el && (el.innerHTML = txt); return self; } //set html text
	this.htmlList = function(list, txt) { return self.each(list, el => { self.htmlElem(el, txt); }); } //set html text
	this.html = function(selector, el, txt) { return self.htmlList(self.findAll(selector, el), txt); } //set html text
	this.textElem = function(el, txt) { el && (el.textContent = txt); return self; } //set html text
	this.textlList = function(list, txt) { return self.each(list, el => { self.textElem(el, txt); }); } //set html text
	this.text = function(selector, el, txt) { return self.textlList(self.findAll(selector, el), txt); } //set html text
	this.emptyElem = function(el) { return !el || !fnTrim(el.textContent); } //has contents
	this.emptyList = function(list) { return toArray(list).every(self.emptyElem); } //all elements are empty?
	this.empty = function(selector, el) { return !self.emptyList(self.findAll(selector, el)); } //has all contents?
	this.hasClass = function(el, name) { return el && el.classList.contains(name); } //contains simple class name
	this.addClassElem = function(el, name) { el && split(name).forEach(cls => { el.classList.add(cls); }); return self; }
	this.addClassList = function(list, name) { return self.each(list, el => { self.addClassElem(el, name); }); }
	this.addClass = function(selector, el, name) { return self.addClassList(self.findAll(selector, el), name); }
	this.delClassElem = function(el, name) { el && split(name).forEach(cls => { el.classList.remove(cls); }); return self; }
	this.delClassList = function(list, name) { return self.each(list, el => { self.delClassElem(el, name); }); }
	this.delClass = function(selector, el, name) { return self.delClassList(self.findAll(selector, el), name); }
	this.mvClassElem = function(el, from, to) { return self.delClassElem(el, from).addClassElem(el, to); }
	this.mvClassList = function(list, from, to) { return self.each(list, el => { self.mvClassElem(el, from, to); }); }
	this.mvClass = function(selector, el, from, to) { return self.mvClassList(self.findAll(selector, el), name); }
	this.setClassElem = function(el, mask, name) { return (mask) ? self.addClassElem(el, name) : self.delClassElem(el, name); }
	this.setClassList = function(list, mask, name) { return self.each(list, (el, i) => { self.setClassElem(el, (mask >> i) & 1, name); }); }
	this.setClass = function(selector, el, mask, name) { return self.setClassList(self.findAll(selector, el), mask, name); }
	this.strip = function(str) { self.htmlElem(HTML_DIV, str); return getText(HTML_DIV); }; //remove html entities

	this.first = function(el) { return el && el.firstChild; }
	this.last = function(el) { return el && el.lastChild; }
	this.prev = function(el) { return el && el.previousElementSibling; }
	this.prevElem = function(el, selector) {
		for (let prev = self.prev(el); prev; prev = prev.previousElementSibling) //Loop through all prev siblings
			if (match(prev, selector)) return prev;
		return null;
	}
	this.prevList = function(el, selector) {
		let list = []; //result container
		for (let prev = self.prev(el); prev; prev = prev.previousElementSibling) //Loop through all prev siblings
			match(prev, selector) && list.push(prev);
		return list;
	}
	this.next = function(el) { return el && el.nextElementSibling; }
	this.nextElem = function(el, selector) {
		for (let next = self.next(el); next; next = next.nextElementSibling) //Loop through all next siblings
			if (match(next, selector)) return next;
		return null;
	}
	this.nextList = function(el, selector) {
		let list = []; //result container
		for (let next = self.next(el); next; next = next.nextElementSibling) //Loop through all next siblings
			match(next, selector) && list.push(next);
		return list;
	}
	this.sibling = function(el, selector) { return self.nextElem(el, selector) || self.prevElem(el, selector); }
	this.siblings = function(el, selector) { return self.prevList(el, selector).concat(self.nextList(el, selector)); }
	this.flushElem = function(el) { return self.addClassElem(self.delClassElem(el, opts.errInputClass).sibling(el, TOOLTIP_SELECTOR), opts.hideClass); }
	this.flushList = function(list) { return self.each(list, self.flushElem); }
	this.flush = function(selector, el) { return self.flushList(self.findAll(selector, el)); }

	//************************** DOM modificators and events **************************//
	function newElem(name) { return document.createElement(name); }
	function newChild(el, name) { return el.appendChild(newElem(name)); }
	function newBefore(el, name) { return el.parentNode.insertBefore(newElem(name), el); }
	function newAfter(el, name) { return el.parentNode.insertBefore(newElem(name), el.nextSibling); }

	this.replace = function(e1, e2) { e1 && e1.parentNode.replaceChild(e2, e1); return self; }
	this.removeElem = function(el) { el && el.parentNode.removeChild(el); return self; }
	this.removeList = function(list) { for (let i = fnSize(list) - 1; i >= 0; i--) self.removeElem(list[i]); return self; }
	this.remove = function(selector, el) { return self.removeList(self.findAll(selector, el)); }
	this.prepend = function(el, str) {
		HTML_DIV.innerHTML = minify(fnTrim(str));
		while (HTML_DIV.lastChild)
			el.prepend(HTML_DIV.lastChild);
		return self;
	}
	this.append = function(el, str) {
		HTML_DIV.innerHTML = minify(fnTrim(str));
		while (HTML_DIV.firstChild)
			el.appendChild(HTML_DIV.firstChild);
		return self;
	}
	this.appendList = function(el, list, mask) {
		return self.each(list, (child, i) => { ((mask >> i) & 1) && el.appendChild(child); });
	}

	//************************** tabs handler functions ***********************//
	this.tabs = function(el) {
		el = el || document.body; //root
		let tabh = self.findAll("ul.tabs>li", el);
		let tabs = toArray(self.findAll(".tab-content", el));
		let i = tabs.findIndex(tab => { return match(tab, ".active"); });

		function showtab(j) {
			i = range(j, 0, fnSize(tabs) - 1); //tabs range
			self.setClassList(tabs, 1<<i, "active"); //tabs list
			self.setClassList(tabh, 1<<i, "active"); //tabs header
			return !self.focus(tabs[i]); //set focus on first
		}
		function tabSelector(href) { //get selector by link href
			return href ? href.substr(href.lastIndexOf("#")) : "#tab-0";
		}

		self.click("a[href^='#tab-']", el, el => { return showtab(tabs.findIndex(tab => { return match(tab, tabSelector(el.href)); })); });
		self.click("a[href='#prev-tab']", el, el => { return showtab(--i); });
		self.click("a[href='#next-tab']", el, el => { return showtab(++i); });
		return self;
	}
	//************************** tabs handler functions ***********************//

	const oTpls = {} //template container
	this.renderElem = function(el, data, tr) {
		el.id = el.id || fnId();
		oTpls[el.id] = oTpls[el.id] || getHtml(el);
		return self.htmlElem(el, tr ? JSON.render(data, oTpls[el.id], tr) : JSON.format(data, oTpls[el.id])); //render/format view
	}
	this.renderList = function(list, data, tr) { return self.each(list, el => { self.renderElem(el, data, tr); }); }
	this.render = function(selector, el, data, tr) { return self.renderList(self.findAll(selector, el), data, tr); }

	const oChildNodes = {} //child elements
	this.optval = function(el, val) { return self.find("option[value='" + val + "']", el); } //get selected option
	this.optext = function(el, val) { return getText(self.optval(el, val)); } //get selected text
	this.setChildrenElem = function(el, mask) {
		if (!el) return self; //nada que hacer
		el.id = el.id || fnId(); //id required, if empty => generate unique
		oChildNodes[el.id] = oChildNodes[el.id] || toArray(el.children); //get all children
		//remove all children and re-append nodes by mask filtering
		self.removeList(el.children).appendList(el, oChildNodes[el.id], mask);
		return self;
	}
	this.setChildrenList = function(list, mask) { return self.each(list, el => { self.setChildrenElem(el, mask); }); }
	this.setChildren = function(selector, el, mask) { return self.selectList(self.findAll(selector, el), mask); }

	//function fnJoin(arr) { return arr.map(fnVal).join(","); } //join values
	this.counterElem = function(el) { //textarea characters counters
		let counter = self.find("#counter", el.parentNode); //counter elem
		function fn(el) { return self.textElem(counter, Math.abs(el.getAttribute("maxlength") - fnSize(el.value))); }
		return fn(el).keyupElem(el, fn);
	}
	this.counterList = function(list) { return self.each(list, self.counterElem); }
	this.counter = function(selector, el) { return self.counterList(self.findAll(selector, el)); }

	function fnJoin(list) { return toArray(list).map(getVal).join(" "); } //join values
	function eqLength(l1, l2) { return (fnSize(l1) > 0) && (l1.length == fnSize(l2)); } //equal length
	this.multival = function(el, group) {
		var values = split(el.value); //split values
		return self.each(group, (el, i) => { el.value = values[i] || el.value; }) //cargo valores
					.changeList(group, () => { el.value = fnJoin(group); }); //group event
	}
	this.listbox = function(parents, group) { //parents = list or single element
		let values = split(getVal(parents[0] || parents)); //split values
		self.each(group, el => { el.checked = (values.indexOf(el.value) > -1); });
		self.changeList(group, el => {
			let checked = self.filter(group, ":checked");
			let value = fnJoin(checked);
			self.each(parents, el => {
				el.checked = eqLength(checked, group);
				el.value = value;
			});
		});
		return self.changeList(parents, el => {
			self.each(group, child => { child.checked = el.checked; });
			self.each(parents, parent => { parent.checked = el.checked; });
			el.value = el.checked ? fnJoin(group) : null;
		});
	}
	this.listbin = function(parents, group) {
		let value = intval(getVal(parents[0] || parents)); //split values
		function parseBin(r, e, i) { return (r | (e.checked << i)); };

		self.each(group, (el, i) => { el.checked = !!((value >> i) & 1); });
		self.changeList(group, el => {
			let checked = self.filter(group, ":checked");
			let value = self.reduce(group, parseBin, 0);
			self.each(parents, el => {
				el.checked = eqLength(checked, group);
				el.value = value;
			});
		});
		return self.changeList(parents, el => {
			self.each(group, child => { child.checked = el.checked; });
			self.each(parents, parent => { parent.checked = el.checked; });
			el.value = self.reduce(group, parseBin, 0);
		});
	}

	//************************** validate functions ***********************//
	this.inputs = function(el) { return self.findAll(INPUTS, el); } //get all inputs field
	this.focusElem = function(el) { el && el.focus(); return self; } //set focus on element
	this.focusList = function(list) { return self.focusElem(list[0]); } //set focus on first
	this.focus = function(el) { return self.focusElem(self.find(INPUTS + ":not([type=hidden]):not([readonly])", el)); } //set focus on first editable input
	this.setFocus = function(el, form) { //set focus on element and active tab
		form = form || el.closest("form");
		let tab = el.closest("[id^='tab-']");
		let selector = tab ? tab.id : "tab-0"; //default tab-0
		let link = self.find("a[href$='" + selector + "']", form);
		link && link.click(); //fire click event
		return self.focusElem(el);
	}

	function showInputTip(el, tip, text) { //tip css + text, and input css + focus
		return self.htmlElem(tip, text).addClassElem(tip, opts.tooltipClass).delClassElem(tip, opts.hideClass).addClassElem(el, opts.errInputClass).focusElem(el);
	}
	this.errElem = function(el, text) {
		return showInputTip(el, self.sibling(el, TOOLTIP_SELECTOR) || newAfter(el, "span"), text); //search prev or new tip?
	}
	this.errList = function(list, errors) { //show tip error if elem.name is into errors
		return errors ? self.each(list, el => { errors[el.name] && self.errElem(el, errors[el.name]); }) : self;
	}
	this.showInputsError = function(list) {
		return self.each(list, el => { //show tooltip text as error
			tip = self.sibling(el, TOOLTIP_SELECTOR);
			self.emptyElem(tip) ? self.flushElem(el) : showInputTip(el, tip, tip.textContent);
		});
	}

	this.validElem = function(el, fnValid) {
		self.flushElem(el); //flush previous field error
		return !fnValid || fnValid(el.value, el); //validate
	}
	this.validList = function(list, checks) {
		self.mbFlush(); //flush global form message
		let elError = checks && self.reduce(list, (err, el) => { //first element error
			return self.validElem(el, checks[el.id]) ? err : (err || el);
		});
		return elError ? !self.setFocus(elError) : true;
	}
	this.valid = function(el, checks) { return self.validList(self.inputs(el), checks) }
	this.fetch = function(el, opts) {
		self.loading(); //show loading wrapper befor call to avoid extra clicks
		let myHeaders = { //default headers to be sended to server
			"X-Requested-With": "XMLHttpRequest",
			"Content-Type": "application/x-www-form-urlencoded"
		};
		opts = Object.assign({ method: "get", mode: "cors", headers: myHeaders }, opts);
		let form = el.closest("form"); //parent form tag
		if (form) { //is simple link?
			let fd = new FormData(form); //build pair key/value
			opts.url = form.getAttribute("action") || opts.url; //destination url
			opts.method = form.getAttribute("method") || opts.method; //request type
			opts.headers["Content-Type"] = form.getAttribute("enctype") || myHeaders["Content-Type"]; //encode
			//preload form data in client using form enctype attribute
			opts.body = (opts.headers["Content-Type"] == "multipart/form-data") ? fd : new URLSearchParams(fd);
		}
		return fetch(opts.url || el.href, opts) //call
					.then(res => { //default response
						opts.status = res.status; //status code
						let contentType = res.headers.get("content-type"); //check if json
						return (contentType && contentType.includes("application/json")) ? res.json() : res.text();
					})
					.catch(opts.error || function(err) { self.mbError(err); }) //error handler
					.finally(() => { self.unloading(); }); //allways
	}
	//************************** validate functions ***********************//

	this.importElem = function(el, data, fnStyle) { el.value = nvl(apply(data[el.id], fnStyle), el.value); return self; }
	this.importList = function(list, data, styles) {
		styles = styles || {}; //parse type container
		return self.each(list, el => { self.importElem(el, data, styles[el.id]); });
	}
	this.import = function(el, data, styles) { return self.importList(self.inputs(el), data, styles) }

	this.exportElem = function(el, data, fnParse) { data[el.id] = apply(el.value, fnParse); return self; }
	this.exportList = function(list, data, parse) {
		parse = parse || {}; //parse type container
		return self.reduce(list, (data, el) => { self.exportElem(el, data, parse[el.id]); return data; }, data || {});
	}
	this.export = function(el, data, parse) { return self.exportList(self.inputs(el), data, parse) }

	//************************** autocomplete input ***********************//
	this.ac = function(el, opts) {
		opts = Object.assign({ minlength: 3, maxResults: 8 }, opts);
		if (!el || !opts.source || !opts.render || el.getAttribute("readonly"))
			return self; //simple input

		let i, idTime; //list index and timer
		i = idTime = -1; //init values

		let dl = self.sibling(el, ".ac-list") || newAfter(el, "ul");
		self.addClassElem(dl, "ac-list").cssElem(dl, "width", el.offsetWidth + "px");
		el.onkeydown = function(ev) {
			clearTimeout(idTime); //clear previous call
			if (self.visible(dl) && ((ev.keyCode === 9) || (ev.keyCode === 13))) {
				(i > -1) && dl.children[i].click(); //click selected option
				return ev.preventDefault(); //if menu is active stop tab
			}
			if (ev.keyCode === 38) { //UP key code
				self.showElem(dl);
				i = Math.max(0, --i);
				self.delClassList(dl.children, "active").addClassElem(dl.children[i], "active"); //focus
				return ev.preventDefault();
			}
			if (ev.keyCode === 40) { //DOWN key code
				self.showElem(dl);
				i = range(++i, 0, fnSize(dl.children) - 1);
				self.delClassList(dl.children, "active").addClassElem(dl.children[i], "active"); //focus
				return ev.preventDefault();
			}
		}
		el.onkeyup = function(ev) {
			let term = this.value; //search text
			if (fnSize(term) < opts.minlength)
				return self.textElem(dl, "").hideElem(dl); //TAB/ENTER or not minlength => hide matches
			if ((ev.keyCode != 8) && (ev.keyCode < 46)) //caracteres especiales - (backspace / delete == 8)
				return ev.preventDefault(); //nada a buscar

			idTime = setTimeout(function() { //new timeout
				dl.innerHTML = ""; //clear previous matches
				opts.source(term, (data) => { //call source
					data && data.slice(0, opts.maxResults).forEach(function(row) {
						let opt = newChild(dl, "li");
						opt.onclick = function() { i = -1; el.value = opts.select(row, el) || term; self.hideElem(dl); };
						opt.innerHTML = opts.render(row, term, dl);
					});
				});
				self.showElem(dl);
			}, 300);
		}
		return self;
	}
	this.multiac = function(el, opts) {
		return self;
	}
	//************************** autocomplete input ***********************//

	//**************************** file reader *************************//
	const fr = new FileReader(); //object reader
	function fnReader(file) { //encoding type: "ISO-8859-1", "UTF-8", ...
		let img = file.type && file.type.startsWith("image/"); //check mime type
		img ? fr.readAsDataURL(file) : fr.readAsBinaryString(file); //fr.readAsText(file, opts.encoding)
	}
	this.freader = function(el, opts) {
		opts = Object.assign({ encoding: "UTF-8", onFile: fnTrue, onComplete: fnTrue }, opts);
		fr.onload = function(ev) {
			opts.onFile(fr.result, flist[j], ev);
			if (++j < size) //next file
				fnReader(flist[j]);
			else
				opts.onComplete(flist);
		}

		var j = 0; //index
		var flist = el.files;
		var size = fnSize(flist);
		//first recursive call
		size && fnReader(flist[j]);
		return self;
	}
	//**************************** file reader *************************//

	//************************** messages box functions ***********************//
	var mboxWrapper;
	const oMsg = Object.assign({}, opts); //init messages config
	const tplMbox = '<div class="@type; @mboxClass;"><b class="@iconClass;">@icon;</b><b class="@buttonClose;">@closeText;</b><p class="@textClass;">@msg;</p></div>';

	function fnFadeOut(el) { return self.fadeOut(el); }
	function fnBox(msg, cls, ico) {
		oMsg.msg = msg; oMsg.type = cls; oMsg.icon = ico; //set config
		var divbox = self.prepend(mboxWrapper, format(tplMbox, oMsg)).first(mboxWrapper); //append new msg
		var altura = self.reduce(divbox.children, (a, el) => { return Math.max(el.offsetHeight, a); }, 0);
		divbox.children[1].onclick = function() { fnFadeOut(divbox); }
		divbox.firstChild.style.height = altura + "px";
		return divbox;
	}

	this.mbOk = function(msg) { msg && fnBox(msg, opts.okClassName, opts.okIcon); return self; }
	this.mbInfo = function(msg) { msg && fnBox(msg, opts.infoClassName, opts.infoIcon); return self; }
	this.mbWarn = function(msg) { msg && fnBox(msg, opts.warnClassName, opts.warnIcon); return self; }
	this.mbError = function(msg) { msg && fnBox(msg, opts.errorClassName, opts.errorIcon); return self; }

	this.mbFlushErr = function() { return self.each(self.children(mboxWrapper, MB_ERROR_SELECTOR), fnFadeOut); }
	this.mbFlush = function() { return self.each(mboxWrapper.children, fnFadeOut); }
	this.mBox = function(selector) {
		selector = selector || getClassSelector(opts.mbWrapperClass);
		mboxWrapper = mboxWrapper || self.find(selector, document.body) || newChild(document.body, "div"); //find or create
		return self.addClassElem(mboxWrapper, opts.mbWrapperClass).each(toArray(mboxWrapper.children), child => {
			let msg = getHtml(child);
			if (!msg)
				self.removeElem(child); //no-msg
			else if (self.hasClass(child, opts.okClassName))
				self.replace(child, fnBox(msg, opts.okClassName, opts.okIcon));
			else if (self.hasClass(child, opts.infoClassName))
				self.replace(child, fnBox(msg, opts.infoClassName, opts.infoIcon));
			else if (self.hasClass(child, opts.warnClassName))
				self.replace(child, fnBox(msg, opts.warnClassName, opts.warnIcon));
			else if (self.hasClass(child, opts.errorClassName))
				self.replace(child, fnBox(msg, opts.errorClassName, opts.errorIcon));
		});
	}
	//************************** messages box functions ***********************//

	//************************** animations ***********************//
	this.scrollTop = function(time) {
		time = time || opts.fadeDuration;
		var scrollStep = -window.scrollY / (time / 15);
		var scrollInterval = setInterval( function() {
			if (window.scrollY > 0)
				window.scrollBy(0, scrollStep);
			else
				clearInterval(scrollInterval);
		}, 15);
		return self;
	}

	this.fadeOut = function(el, time) {
		if (!el) return self;
		time = time || opts.fadeDuration;
		el.style.opacity = 1; //style
		let opacity = 1; //force number

		var fadeInterval = setInterval(() => {
			if (opacity > 0)
				el.style.opacity = opacity -= .1;
			else {
				clearInterval(fadeInterval);
				el.style.display = "none";
			}
		}, time*.1);
		return self;
	}
	this.fadeIn = function(el, time, display) {
		if (!el) return self;
		time = time || opts.fadeDuration;
		el.style.display = display || "block";
		el.style.opacity = 0; //style
		let opacity = 0; //force number

		var fadeInterval = setInterval(() => {
			if (opacity < 1)
				el.style.opacity = opacity += .1;
			else
				clearInterval(fadeInterval);
		}, time*.1);
		return self;
	}
	this.fadeToggle = function(el, time) {
		return isDisplayNone(el) ? self.fadeIn(el, time) : self.fadeOut(el, time);
	}

	this.slideUp = function(el, time) {
		if (!el) return self;
		time = time || opts.fadeDuration;
		let styles = el.style; //elem css styles
		styles.transitionProperty = "height, margin, padding";
		styles.transitionDuration = time + "ms";
		styles.boxSizing = "border-box";
		styles.height = el.offsetHeight + "px";
		el.offsetHeight; //Important!
		styles.overflow = "hidden";
		styles.height = 0;

		//save previous config
		let pt = styles.paddingTop;
		let pb = styles.paddingBottom;
		let mt = styles.marginTop;
		let mb = styles.marginBottom;

		styles.paddingTop = 0;
		styles.paddingBottom = 0;
		styles.marginTop = 0;
		styles.marginBottom = 0;
		return self.delay(() => {
			styles.display = "none";

			//restore init config
			styles.paddingTop = pt;
			styles.paddingBottom = pb;
			styles.marginTop = mt;
			styles.marginBottom = mb;
			styles.removeProperty("height");
			styles.removeProperty("overflow");
			styles.removeProperty("transition-duration");
			styles.removeProperty("transition-property");
		}, time);
	}
	this.slideDown = function(el, time) {
		if (!el) return self;
		time = time || opts.fadeDuration;
		let styles = el.style; //elem css styles
		styles.removeProperty("display");
		styles.display = (styles.display === "none") ? "block" : styles.display;

		//save previous config
		let height = el.offsetHeight;
		let pt = styles.paddingTop;
		let pb = styles.paddingBottom;
		let mt = styles.marginTop;
		let mb = styles.marginBottom;

		styles.overflow = "hidden";
		styles.height = 0;
		styles.paddingTop = 0;
		styles.paddingBottom = 0;
		styles.marginTop = 0;
		styles.marginBottom = 0;
		el.offsetHeight; //Important!
		styles.boxSizing = "border-box";
		styles.transitionProperty = "height, margin, padding";
		styles.transitionDuration = time + "ms";

		//restore init config
		styles.height = height + "px";
		styles.paddingTop = pt;
		styles.paddingBottom = pb;
		styles.marginTop = mt;
		styles.marginBottom = mb;
		return self.delay(() => {
			styles.removeProperty("height");
			styles.removeProperty("overflow");
			styles.removeProperty("transition-duration");
			styles.removeProperty("transition-property");
		}, time);
	}
	this.slideToggle = function(el, time) {
		return isDisplayNone(el) ? self.slideDown(el, time) : self.slideUp(el, time);
	}

	var elLoading;
	this.loading = function(selector) {
		selector = selector || getClassSelector(opts.loadingClass);
		elLoading = elLoading || self.find(selector, document.body) || newChild(document.body, "div"); //find or create
		return self.delClassElem(elLoading, opts.hideClass).addClassElem(elLoading, opts.loadingClass).showElem(elLoading);
	}
	this.unloading = function() { return fnFadeOut(elLoading); }
	//************************** animations ***********************//

	//************************** Handlers and Events **************************//
	function addEvent(el, name, fn) {
		el.addEventListener(name, (ev) => {
			nvl(fn(el, ev), true) || ev.preventDefault();
		}, false);
		return self;
	}
	this.clickElem = function(el, fn) { return addEvent(el, "click", fn); }
	this.clickList = function(list, fn) { return self.each(list, el => { self.clickElem(el, fn); }); }
	this.click = function(selector, el, fn) { return self.clickList(self.findAll(selector, el), fn); }
	this.changeElem = function(el, fn) { return addEvent(el, "change", fn); }
	this.changeList = function(list, fn) { return self.each(list, el => { self.changeElem(el, fn); }); }
	this.change = function(selector, el, fn) { return self.changeList(self.findAll(selector, el), fn); }
	this.keyupElem = function(el, fn) { return addEvent(el, "keyup", fn); }
	this.keyupList = function(list, fn) { return self.each(list, el => { self.keyupElem(el, fn); }); }
	this.keyup = function(selector, el, fn) { return self.keyupList(self.findAll(selector, el), fn); }
	this.ready = function(fn) { return addEvent(document, "DOMContentLoaded", fn); }
	this.scroll = function(fn) { return addEvent(window, "scroll", fn); }
	//************************** Handlers and Events **************************//
	opts.ready && this.ready(opts.ready); //auto call onload if has handler
}
