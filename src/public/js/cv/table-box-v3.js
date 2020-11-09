(function($) {
	//global default config
	var settings = {
		//css clases and tag selectors
		//tboxClass: "tb-build", //all table box selector
		//dataClass: "tb-data", //data row class style
		//groupClass: "tb-group", //group class style (subtables)
		//pivotClass: "tb-pivot", //pivot table selector
		//orderClass: "tb-order", //order class style
		//descClass: "tb-order-desc", //toggle with asc
		//ascClass: "tb-order-asc", //toggle with desc

		//config params
		//data: [], //data container
		order: {}, //columns order (asc/desc)
		stats: {}, //stats resume
		types: {}, //parse data type
		styles: {}, //styling view
		tpls: {}, //template container
		groupColumns: [], //columns name for groups
		groupExpand: -1, //default expand groups
		noCellText: "", //default text for empty cells
		noBodyText: "", //default tbody text (no rows in tbody)

		//evebts handler
		onLoad: fnVoid,
		beforePush: fnVoid,
		onPush: fnVoid,
		afterPush: fnVoid,
		onChange: fnVoid,
		onView: fnVoid
	};

	//const selectors
	var TAG_TABLE = "table";
	var TAG_BODY = "tbody";
	var TAG_ROW = "tr";

	//common helper functions
	function tbFormat(str, obj, tr) { return str.replace(RE_VAR, function(m, k) { return nvl(obj[k], ""); }); };
	function tbRender(node, str, obj, tr) { return str.replace(RE_VAR, function(m, k) { return nvl(apply(obj[k], tr[k]), node.noCellText); }); };
	function tbRenderNode(node, tpl, tr) { return node.data.map(function(row) { return tbRender(node, tpl, row, tr); }).join(""); };

	function wrap(tag, txt) { return "<" + tag + ">" + txt + "</" + tag + ">"; };
	function setBody(table, str) { $("tbody,tfoot", table).remove(); $(table).append(str); };
	function tdrow(text) { return wrap(TAG_ROW, '<td colspan="@columns;">' + text + "</td>"); } //tpl td colspan
	function tfoot(node, tplfoot) { return wrap("tfoot", render(tplfoot, node.stats, node.styles)); } //tpl tfoot
	function tbody(node, tplrow, tplfoot) { return wrap(TAG_BODY, tbRenderNode(node, tplrow, node.styles) || format(tdrow(node.noBodyText), node.stats)) + tfoot(node, tplfoot); };

	function setCols(stats, cols) {
		stats.columns = cols;
		stats.columns_1 = cols - 1;
		stats.columns_2 = cols - 2;
		return stats;
	}
	function setStats(stats, rows, cols) {
		stats.numrows = rows;
		return setCols(stats, cols);
	}
	function tree(root) {
		root.grouped = true; //group indicator
		root.childnodes = []; //childnodes root
		root.data.forEach(function(row, i) {
			var node = root; //root node
			node.groupColumns.forEach(function(colName, g) {
				var text = apply(row[colName], node.styles[colName]);
				var child = node.childnodes.find(function(n) { return (n.text == text); });
				if (!child) {
					child = $.extend({ text: text }, root);
					child.stats = setStats({ level: g }, 0, node.stats.columns);
					child.stats.text = child.stats[colName] = text; //set var value
					child.data = []; child.childnodes = []; //build tree
					node.childnodes.push(child); //add new child
					node.childnodes.sort(function(a, b) { return cmp(a.text, b.text); }); //sort subgroups
					child.beforePush(child.stats); //call middle event handler
				}
				child.data.push(row); //add row to child node
				child.onPush(row, child.stats, i); //call middle event handler
				node = child; //move to next deep level
			});
		});
		return root;
	};

	function tplGroup(node, tplrow, tplfoot) {
		var nodes = node.childnodes.map(function(child) {
			child.afterPush(setStats(child.stats, child.data.length, child.stats.columns)); //call middle event handler
			var tpl = tdrow('<table class="tb-group tb-group-@level;">' + tplGroup(child, tplrow, tplfoot) + "</table>");
			return format(wrap(TAG_BODY, (child.groupCaption || tdrow(child.text)) + tpl), child.stats);
		});
		return nodes.length ? wrap(TAG_BODY, nodes.join("")) : tbody(node, tplrow, tplfoot);
	};
	function tplPivot(node, tpl) {
		return node.childnodes.map(function(child) {
			child.stats.rowspan = child.childnodes.length + 1; //td rowspan
			child.afterPush(setStats(child.stats, child.data.length, child.stats.columns)); //call middle event handler
			var aux = tbFormat(tpl, child.stats, child.styles).split("<td"); //format template row
			return extract(aux, 1, child.stats.level).join("<td") + tplPivot(child, tpl);
		}).join("");
	};

	var oTables = {};
	$.fn.tbList = function() { return this.each(function(i, el) { oTables[el.id] && oTables[el.id].list(); }); };
	$.fn.tbPush = function(row) { return this.each(function(i, el) { oTables[el.id] && oTables[el.id].push(row); }); };
	$.fn.tbLoad = function(data) { return this.each(function(i, el) { oTables[el.id] && oTables[el.id].load(data); }); };
	$.fn.tbExtract = function(i, n) { return this.each(function(j, el) { oTables[el.id] && oTables[el.id].extract(i, n); }); };
	$.fn.tbIndex = function(row, name) { var tb = oTables[this.attr("id")]; return tb ? tb.ifind(row, name) : -1; };
	$.fn.tBox = function(opts) {
		var self = this; //self instance
		$.extend(opts, $.extend({}, settings, opts));
		var tables = self.filter(TAG_TABLE);
		var lists = self.not(TAG_TABLE);

		opts.recalc = function() {
			opts.beforePush(opts.stats);
			opts.data.forEach(function(row, i) { row.tbIndex = i; row.tbIndex1 = i + 1; opts.onPush(row, opts.stats, i); });
			opts.afterPush(setStats(opts.stats, opts.data.length, 0));
			return opts;
		};
		opts.push = function(row) { if (row) { opts.data.push(row); opts.recalc(); } return opts; }; //add new element
		opts.extract = function(i, n) { opts.data.splice(i, n || 1); return opts.recalc(); }; //remove i to n elements
		opts.reset = function() { return opts.extract(0, opts.data.length).list(); }; //remove all and recalc stats
		opts.ifind = function(row, name) { name = name || "id"; return row ? ifind(opts.data, name, row[name]) : -1; };
		opts.load = function(data) { //set new data and relist
			if (data) {
				opts.data = data;
				opts.recalc().list();
			}
			return opts;
		};

		opts.list = function() {
			lists.each(function(i, elem) {
				var tpl = opts.tpls[elem.id] || html(elem) || "";
				$(elem).html(tbRenderNode(opts, tpl, opts.styles));
				opts.tpls[elem.id] = tpl; //save tpl
				opts.onView(elem, opts.data, opts.stats); //after draw event
			}).filter("select").unbind("change").change(function(ev) {
				opts.onChange(opts.data[this.selectedIndex], opts.data, this, ev);
			});
			tables.each(function(t, table) {
				var idFooter = table.id + "-footer";
				setCols(opts.stats, $("th", table.tHead).length);
				var tpl = opts.tpls[table.id] || (table.tBodies && html(table.tBodies[0])) || "";
				var tplfoot = opts.tpls[idFooter] || html(table.tFoot) || "";
				setBody(table, $(table).hasClass("tb-pivot") 
									? (wrap(TAG_BODY, tplPivot(tree(opts), tpl)) + tfoot(opts, tplfoot))
									: tbody(opts, tpl, tplfoot));
				opts.tpls[table.id] = tpl; //save body tpl
				opts.tpls[idFooter] = tplfoot; //save footer tpl
				opts.onView(table, opts.data, opts.stats); //after draw event
			});
			opts.grouped = false; //group indicator
			return opts; //return config
		};
		opts.group = function() {
			tables.not(".tb-pivot").each(function(t, table) {
				var top = $(document).scrollTop(); //screen top offset
				var visibles = $(TAG_TABLE, table).get().map(function(t, i) { return $(t).is(":visible") ? i : -1; });

				var tplfoot = opts.tpls[table.id + "-footer"];
				setCols(opts.stats, $("th", table.tHead).length);
				setBody(table, tplGroup(tree(opts), opts.tpls[table.id], tplfoot) + tfoot(opts, tplfoot)); //add subgroups

				var subtables = $(TAG_TABLE, table); //new subtables group
				subtables.filter("table.tb-group-" + (opts.groupColumns.length - 1)).prepend($(table.tHead).clone(true)); //clone subtable header
				subtables.closest(TAG_ROW).prev().addClass("tb-resume").click(function() { $(this.nextSibling).fadeToggle(); }); //title group
				subtables.filter(".tb-group-" + opts.groupExpand).parents().show(); //show deep subtables

				opts.onView(table, opts.data, opts.stats); //after draw event
				subtables.each(function(i, t) { (visibles.indexOf(i) > -1) && $(t).parents().show(); });
				$(document).scrollTop(top); //restore screen top offset
			});
			return opts; //return config
		};

		//default xml object
		var oXML = { xmlColumns: [] };
		opts.xml = function() {
			var xml = [opts].concat(Array.prototype.slice.call(arguments)).map(function(ox, i) { //iterate over tables
				$.extend(oXML, ox); //get specific options configuration
				var rows = oXML.data.map(function(row, i) {
					var cells = oXML.xmlColumns.map(function(name) {
						var value = row[name]; //value cell
						return wrap(name, Date.valid(value) ? value.dfIso() : strip(value));
					});
					return wrap(TAG_ROW, cells.join(""));
				});
				return wrap("t" + i, rows.join(""));
			}).join("");
			return '<?xml version="1.0" encoding="utf-8"?>' + wrap("tables", xml);
		};

		//xsl constants, default object, serialize formats, output strings...
		var TYPE_STRING = "String"; //string type constant
		var tplHeaderXLS = '<?xml version="1.0" encoding="utf-8" standalone="yes"?><?mso-application progid="Excel.Sheet"?>';
		var tplWorkbookXLS = '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">@workbook;</Workbook>';
		var tplDocumentProperties = '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>@author;</Author><Created>@created;</Created><Version>10.3501</Version></DocumentProperties>';
		var tplStyles = '<Styles><Style ss:ID="Default" ss:Name="Normal"><Font/><Interior/><NumberFormat/></Style><Style ss:ID="Header"><Font ss:Bold="1" ss:Size="10"/><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/></Style><Style ss:ID="HeadRow"><Font ss:Bold="1" ss:Size="10"/><Alignment ss:Vertical="Top"/></Style><Style ss:ID="Float"><NumberFormat ss:Format="Standard"/><Alignment ss:Horizontal="Right"/></Style><Style ss:ID="Integer"><NumberFormat ss:Format="0"/><Alignment ss:Horizontal="Right"/></Style><Style ss:ID="DefaultDate"><NumberFormat ss:Format="Long Date"/></Style><Style ss:ID="LatinDate"><NumberFormat ss:Format="dd/mm/yyyy"/></Style>@wsStyles;</Styles>';
		var tplWorksheetXLS = '<Worksheet ss:Name="@wsName;"><Table><Row ss:AutoFitHeight="1" ss:StyleID="Header">@headers;</Row>@rows;</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios></WorksheetOptions></Worksheet>';
		//var tplCellHref = '<Cell ss:StyleID="@idStyle;" ss:HRef="@href;"><Data ss:Type="@nameType;">@data;</Data></Cell>';
		var tplCellXLS = '<Cell ss:StyleID="@idStyle;"@extra;><Data ss:Type="@nameType;">@xlsval;</Data></Cell>';

		var oXLS = { //default xls object
			author: "Table Box", created: Date.now(),
			wsStyles: "", headers: "", rows: "", wsName: "Sheet",
			xlsColumns: {}, xlsStyles: {}
		};
		function setcss(style, extra) { oXLS.idStyle = style; oXLS.extra = ""; return oXLS; };
		function setval(type, value) { oXLS.nameType = type; oXLS.xlsval = value; return oXLS; };
		function setxls(type, style, value, extra) { setcss(style, extra); return setval(type, value); };

		opts.xls = function() {
			var prop = format(tplDocumentProperties + tplStyles, $.extend(oXLS, opts)); //xls document styles and properties
			var xls = [opts].concat(Array.prototype.slice.call(arguments)).map(function(ox, i) { //iterate over tables
				$.extend(oXLS, ox); //get specific options configuration
				var columns = Object.keys(oXLS.xlsColumns); //columns to export
				oXLS.headers = Object.values(oXLS.xlsColumns).map(function(text) { //titles
					return format(tplCellXLS, setxls(TYPE_STRING, "Header", text));
				}).join("");
				oXLS.rows = oXLS.data.map(function(row) {
					return wrap("Row", columns.map(function(name) {
						var value = row[name]; //value cell
						isstr(value) ? setval(TYPE_STRING, strip(value)) : 
									(Date.valid(value) ? setval("DateTime", value.dfIso()) : setval("Number", value));
						return format(tplCellXLS, setcss(oXLS.xlsStyles[name] || "Default"));
					}).join(""));
				}).join("");
				return format(tplWorksheetXLS, oXLS);
			}).join("");
			return tplHeaderXLS + tplWorkbookXLS.replace("@workbook;", prop + xls);
		};

		//order event on table/subtables
		var tOrder = $("[name].tb-order", tables).each(function(i, elem) {
			var k = opts.order[$(elem).attr("name")]; //field order
			k && $(elem).addClass("tb-order-" + k);
		}).click(function() {
			var k = $(this).attr("name"); //field name
			var dir = opts.order[k] = (opts.order[k] == "asc") ? "desc" : "asc"; //toggle dir
			opts.data.sort((dir == "asc") ? function(a, b) { return cmp(a[k], b[k]); } : function(a, b) { return cmp(b[k], a[k]); });
			tOrder.removeClass("tb-order-asc tb-order-desc").filter("[name='" + k + "']").addClass("tb-order-" + dir);
			opts.grouped ? opts.group() : opts.list();
		});

		//preload specific data on-read
		var _id = self.attr("id"); //get table.id
		if (_id) { //element exists
			oTables[_id] = opts; //save options
			opts.data = opts.data || JSON.read(self.prev("#tb-" + _id).text()) || []; //pre-processed data
			for (var k in opts.types) //parse type data once
				opts.data.forEach(function(row) { row[k] = apply(row[k], opts.types[k]); });
			opts.data = opts.onLoad(opts.data) || opts.data; //process data
			opts.recalc().list(); //calc stats and paint list
		}
		return self;
	};

	$.fn.save = function(opts) {
		opts = opts || {}; //opts is optional
		return this.each(function(i, el) {
			var name = $(el).attr("name");
			var data = JSON.read(text(el)); //parse data
			JSON.set(name, data && JSON.stringify(apply(data, opts[name]))); //save
		});
	};
	$.fn.render = function() {
		var tags = this.find("[render],[clear],[contents]");
		tags.filter("[render]").filter("[render='0'],[render='false']").remove(); //0 o false (OR)
		tags.filter("[clear]").filter("[clear!='0'][clear!='false']").remove(); //ni 0 ni false (AND)
		tags.filter("[contents]").filter("[contents='0'],[contents='false']").text("");
		tags.removeAttr("render").removeAttr("clear").removeAttr("contents");
		return this;
	};
	$.fn.tbTree = function() {
		return this.each(function(i, elem) {
			$(elem).children("[parent!='']").each(function(i, child) {
				var node = $("#" + $(child).attr("parent"), elem)[0]; //get parent node
				node && addChild((node.lastChild.tagName == elem.tagName) ? node.lastChild : addElem(node, elem.tagName), child);
			});
		});
	};

	/*$.fn.xmlReader = function(opts) {
		return this.each(function(t, table) {
			$.extend(oXML, settings, opts);
			$(oXML.xmlTagRow || TAG_ROW, table).each(function(i, row) {
				var cells = $(oXML.xmlColumns.join(), row) || $(row).children();
				var data = cells.get().reduce(function(row, cell, i) {
					var name = cell.nodeName + (isset(row[cell.nodeName]) ? i : "");
					row[name] = apply(text(cell), oXML.types[cell.nodeName]);
					return row;
				}, {});
				oXML.data.push(data);
			});
			oXML.recalc();
		});
	};*/
}(jQuery));
