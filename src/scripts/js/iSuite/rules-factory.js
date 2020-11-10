
function RulesFactory() {
	//asociaciones entre los campos del fichero bancario y las estructuras de sorolla
	const DOMICILIACION = "Domiciliaci&oacute;n";
	const FORMA_COBRO = {
		"043": "R&aacute;faga", "073": "R&aacute;faga", "2004575679800": "R&aacute;faga", 
		"128": "Intereses - 300101 1520.04", "173": DOMICILIACION, "174": DOMICILIACION, "239": DOMICILIACION, "620": DOMICILIACION, 
		"709": "MIT", "579": "Comisiones Varias", "731": "Comisiones Varias", "767": "Comisiones Varias"
	};
	const ORGANICAS = { "300101": "GERENCIA", "300955": "SERVICIO DE GESTI&Oacute;N ACAD&Eacute;MICA" };
	const PROPIO_ORGANICA = { "2004575679800": "300955", "173": "300955", "174": "300955", "099": "300101" };
	const PROPIO_ECONOMICA = { "2004575679800": "1303.00", "173": "1310.00", "174": "1310.00", "099": "1520.04" };
	const CS = "Contra&iacute;do simult&aacute;neo";
	const NC = "No Conciliables - ";

	//Norma 19
	var n19 = { id: "n19", files: 0, total: 0, numrows: 0, data: [] };
	var n19Config = {
		nameColumns: ["InstdAmt", "ReqdColltnDt", "MndtId", "Ustrd", "Dbtr", "DbtrAcct", "Nm", "IBAN"],
		tagRow: "TxInfAndSts",

		onLoad: function(fila) {
			fila.fCobro = fila.fOperacion = fila.REQDCOLLTNDT.toDateTime();
			fila.importe = +fila.INSTDAMT;
			fila.cuenta1 = fila.IBAN;
			fila.cuenta2 = fila.IBAN9;
			return n19.data.push(fila);
		}
	};

	function n19Parse(contents) {
		$(HTML_P).html(contents); //root node
		//inicializo los datos a mostrar en la cabecera del informe
		$("MsgId, CreDtTm, OrgnlMsgId, OrgnlMsgNmId", HTML_P).get().reduce(xmlAppend, n19);
		$("OrgnlPmtInfAndSts", HTML_P).tbInit(n19Config).tbLoad(n19Config);
		n19.fecha = n19.CREDTTM.toDateTime();
		n19.numrows = n19.data.length;
		n19.nombre = n19.ORGNLMSGNMID;
		delete n19.CREDTTM;
		n19.files++;
		return n19;
	};

	function n19Fetch() { return ""; };
	function n19Reset() {
		n19.files = n19.numrows = 0;
		n19.data.reset();
		return n19;
	};
	//********************************************//

	//Norma 43
	//var tpvs = [];
	var referencias = [];
	var n43 = { id: "n43", files: 0, total: 0, ncGdc: 0, ncElavon: 0, incorporado: 0, numrows: 0, data: [] }; //n43 header
	var n43k1 = ["codigo", "entidad", "oficina", "cuenta", "fInicio", "fFin", "debe", "inicial", "divisa", "modalidad", "nombre"];
	var n43k2 = ["codigo", "libre", "oficina", "fOperacion", "fValor", "comun", "propio", "debe", "importe", "documento", "ref1", "ref2"];
	var n43k3 = ["codigo", "entidad", "oficina", "cuenta", "nDebes", "debe", "nHaber", "haber", "idFinal", "saldo", "divisa", "libre"];

	function n43Date(str) { return ("20" + str).toDate(); };
	function dfN43(date) { return date.toArray().splice(0, 3).join("").substr(2, 6); }; //yymmdd
	function nfN43(val) { return Math.abs(val).toFixed(2).replace(".", "").lpad(14); }; //00000000005501
	function n43Head(fInicio, fFin, imp) {
		n43Reset();
		n43.files++;
		n43.fInicio = fInicio;
		n43.fFin = fFin;
		n43.inicial = imp;
		return n43;
	};

	function getForma(fila) { return FORMA_COBRO[fila.ref1] || FORMA_COBRO[fila.propio] || "Otras"; };
	function setForma(fila, ji, forma) { fila.ji = ji; fila.forma = forma; };
	function setApplicacion(row) {
		row.organica = row.organica || PROPIO_ORGANICA[row.ref1] || PROPIO_ORGANICA[row.propio] || "";
		row.economica = row.economica || PROPIO_ECONOMICA[row.ref1] || PROPIO_ECONOMICA[row.propio] || "Manual";
		row.descOrganica = row.descOrganica || ORGANICAS[row.organica] || "";
		row.aplicacion = fnTrim(row.organica + " " + row.economica); //aplicacion a mostrar en la vista
		row.fCobro = (row.forma == DOMICILIACION) ? row.fCobro : row.fOperacion;
		row.dnialu = row.dnialu || "";
		row.nombre = row.nombre || "";
		row.aplicacionDesc = row.descOrganica;
		return row;
	};

	function n43Parse(contents) {
		contents.lines().forEach(function(row) {
			if (row.startsWith("11")) {
				n43k1.combine(row.chunk(2, 4, 4, 10, 6, 6, 1, 14, 3, 1).map(fnTrim), n43);
				n43Head(n43Date(n43.fInicio), n43Date(n43.fFin), +n43.inicial.insertAt(12, "."));
			}
			else if (row.startsWith("22")) {
				var fila = n43k2.combine(row.chunk(2, 4, 4, 6, 6, 2, 3, 1, 14, 10, 12).map(fnTrim));
				fila.ref1 = fila.ref1 ? ("2" + fila.ref1) : fila.ref1;
				fila.importe = +fila.importe.insertAt(12, ".");
				fila.importe *= (fila.debe == "1") ? -1 : 1;
				fila.fOperacion = n43Date(fila.fOperacion);
				fila.fValor = n43Date(fila.fValor);
				fila.fCobro = n43.fFin; //default domiciliacion
				fila.ref1 && referencias.push(fila.ref1);
				n43.total += fila.importe; //total calculado
				n43.data.push(fila); //aÃ±ado la fila a la coleccion
				if (((fila.propio == "043") || (fila.propio == "073")) && (fila.ref2.substr(8, 3) != "000")) {
					n43.ncGdc += fila.importe; //sumo importe no conciliable
					setForma(fila, NC + "GDC", "UXXI-EC"); //sufijo del GDC
				}
				else
					setForma(fila, CS, getForma(fila)); //contraido simult. + forma de cobro
				setApplicacion(fila);
			}
			else if (row.startsWith("2301")) {
				var fila = n43.data.last();
				fila.concepto1 = row.substr(4, 38).trim();
				fila.concepto2 = row.substr(42, 38).trim();
				fila.concepto = fnTrim(fila.concepto1 + " " + fila.concepto2);
				if (fila.concepto2.indexOf("0 3.104 6.261 0") > 0) {
					n43.ncElavon += fila.importe; //sumo importe no conciliable
					setForma(fila, NC + "Redsys", "Redsys"); //redsys
				}
			}
			else if (row.startsWith("2302")) {
				var fila = n43.data.last();
				fila.concepto3 = row.substr(4, 38).trim();
				fila.concepto4 = row.substr(42, 38).trim();
				if (fila.concepto3.indexOf("0031046261SAN") > 0) {
					n43.ncElavon += fila.importe; //sumo importe no conciliable
					setForma(fila, NC + "Elavon", "TPV Virtual Elavon"); //elavon
				}
			}
			else if (row.startsWith("2303")) {
				var fila = n43.data.last();
				fila.concepto5 = row.substr(4, 38).trim();
				fila.concepto6 = row.substr(42, 38).trim();
				//if (!isNaN(fila.concepto5) && (tpvs.indexOf(fila.concepto5) < 0))
					//tpvs.push(fila.concepto5);
			}
			else if (row.startsWith("2304")) {
				var fila = n43.data.last();
				fila.concepto7 = row.substr(4, 38).trim();
				fila.concepto8 = row.substr(42, 38).trim();
				fila.concepto = fnTrim(fila.concepto + " " + fila.concepto7 + " " + fila.concepto8);
			}
			else if (row.startsWith("2305")) {
				var fila = n43.data.last();
				fila.concepto9 = row.substr(4, 38).trim();
				fila.concepto10 = row.substr(42, 38).trim();
				fila.concepto = fnTrim(fila.concepto + " " + fila.concepto9 + " " + fila.concepto10);
			}
			else if (row.startsWith("33")) { //linea final => comprobacion de importes
				var fila = n43k3.combine(row.chunk(2, 4, 4, 10, 5, 14, 5, 14, 1, 14, 3, 4).map(fnTrim));
				//n43.importe = (+fila.haber.insertAt(12, ".")) - (+fila.debe.insertAt(12, "."));
				n43.numrows = (+fila.nHaber) + (+fila.nDebes); //ojo con los incorporados TVP!
				n43.saldo = +fila.saldo.insertAt(12, ".");
			}
		});
		n43.fInicio_input = n43.fInicio.latin();
		n43.fFin_input = n43.fFin.latin();
		n43.ccc = n43.entidad + " " + n43.oficina + " " + n43.cuenta;
		n43.fRango = "Del " + n43.fInicio_input + " al " + n43.fFin_input;
		n43.conciliable = n43.total + n43.incorporado - n43.ncGdc - n43.ncElavon;
		return n43;
	};

	function n43Reset() {
		n43.files = n43.total = n43.ncGdc = n43.ncElavon = n43.incorporado = n43.numrows = 0;
		n43.data.reset();
		return n43;
	};
	//********************************************//

	//Norma 57
	var n57 = { id: "n57", files: 0, total: 0, numrows: 0, data: [] }; //n57 header
	var n57k1 = ["codigo", "op", "libre1", "emisor", "libre2", "libre3", "entidad", "libre4", "fecha", "libre5", "libre6", "libre7", "libre8"];
	var n57k2 = ["codigo", "op", "libre1", "emisor", "sufijo", "libre2", "fecha",  "libre3", "libre4", "libre5", "libre6", "libre7", "libre8"];
	var n57k3 = ["codigo", "op", "libre1", "emisor", "sufijo", "canal", "entidad", "oficina", "fCobro", "importe",  "idCobro", "dEntidad", "dSucursal", "dc", "dCuenta", "domiciliacion", "anulacion", "ref1", "ref2"];
	var n57k4 = ["codigo", "op", "libre1", "emisor", "sufijo", "libre2", "numrows", "libre3", "importe", "libre4", "libre5", "libre6", "signo", "libre7"];

	function n57Date(str) { return Date.build(str.insertAt(4, "20").chunk(2, 2).swap(0, 2)); }
	function dfN57(date) { return date.toArray().splice(0, 3).swap(0, 2).join("").replaceAt(4, 2, ""); }; //ddmmyy
	function nfN57(val) { return Math.abs(val).toFixed(2).replace(".", "").lpad(14); }; //00000000005501
	function n57Row60(fila) {
		n57.fInicio = fila.fCobro.min(n57.fInicio);
		n57.total += fila.importe;
		n57.numrows++;
		return fila
	};

	function n57Parse(contents) {
		contents.lines().forEach(function(row) {
			if (row.startsWith("01")) { //registro cabecera de fichero
				n57k1.combine(row.chunk(2, 2, 6, 8, 3, 1, 4, 10, 6, 6, 6, 20, 1, 14, 11).map(fnTrim), n57);
				var aux = n57Date(n57.fecha);
				n57.fecha = aux.max(n57.fecha);
				n57.files++;
			}
			else if (row.startsWith("02")) { //registro cabecera de emisora - sufijo
				var fila = n57k2.combine(row.chunk(2, 2, 6, 8, 3, 1, 4, 10, 6, 6, 6, 20, 1, 14, 11).map(fnTrim));
				n57.sufijo = fila.sufijo;
			}
			else if (row.startsWith("60")) { //registro individual
				var fila = n57k3.combine(row.chunk(2, 2, 6, 8, 3, 1, 4, 4, 6, 12, 6, 4, 4, 2, 10, 1, 1, 13, 11).map(fnTrim));
				fila.propio = "043"; //default = rafaga
				fila.plan = fila.idActividad = fila.actNombre = "";
				fila.canal = (fila.canal == "2") ? "Autoservicio" : (fila.canal == "3") ? "Banca Virtual" : "Ventanilla";
				fila.importe = +fila.importe.insertAt(10, ".");
				fila.importe *= (fila.anulacion == "1") ? -1 : 1;
				fila.fOperacion = fila.fCobro = n57Date(fila.fCobro);
				fila.ref1 && referencias.push(fila.ref1); //add ref1 to container
				setForma(fila, CS, getForma(fila)); //contraido simult. + forma de cobro
				n57.data.push(n57Row60(setApplicacion(fila))); //add application info
			}
			/*else if (row.startsWith("80")) { //registro de totales emisora - sufijo
				var fila = n57k4.combine(row.chunk(2, 2, 6, 8, 3, 1, 6, 8, 12, 6, 20, 1, 1, 13, 11).map(fnTrim));
				n57.importe += (+fila.importe.insertAt(10, ".")) * ((fila.signo == "1") ? -1 : 1); //sumo sufijo
			}*/
		});
		n57.fFin = n57.fecha;
		n57.fRango = "Del " + n57.fInicio.latin() + " al " + n57.fFin.latin();
		return n57;
	};

	function n57Fetch() { return ""; };
	function n57ResetStats() { n57.files = n57.total = n57.numrows = 0; delete n57.fInicio; };
	function n57Reset() { n57ResetStats(); n57.data.reset(); return n57; };
	//********************************************//

	//metodos propios de la factoria
	this.parse = function(contents) {
		if (contents.startsWith("<?xml"))
			n19Parse(contents);
		else if (contents.startsWith("11"))
			n43Parse(contents);
		else if (contents.startsWith("01"))
			n57Parse(contents);
		return this;
	};

	this.acLoad = function(row, recibo) {
		row.ji = recibo.ji ? ("Factura Previa - " + recibo.ji) : row.ji;
		row.organica = recibo.organica || row.organica;
		row.economica = recibo.economica || row.economica;
		row.descOrganica = recibo.descOrganica || row.descOrganica || ORGANICAS[row.organica] || "";
		row.aplicacion = fnTrim(row.organica + " " + row.economica); //aplicacion a mostrar en la vista
		row.dnialu = recibo.dnialu || row.dnialu;
		row.nombre = recibo.nombre || row.nombre;
		row.aplicacionDesc = row.descOrganica;
		row.plan = recibo.plan || row.plan;
		row.idActividad = recibo.idActividad || row.idActividad;
		row.actNombre = recibo.actNombre || row.actNombre;
	};

	this.normalize = function(row) {
		row.ji = row.ji || CS; //defecto = contraido simult.
		row.comun = row.comun || "00"; //concepto comun bancos
		row.propio = row.propio || "043"; //default = rafaga
		row.fValor = row.fValor || row.fOperacion;
		row.debe = row.debe || "2"; //default = apunte haber
		row.documento = row.documento || "0"; //default = 0
		row.concepto = row.concepto || ""; //default empty
		return setApplicacion(row);
	};

	this.tr57to43 = function() {
		if (!n57.numrows) return this; //hay norma 57?
		n43Head(n57.fInicio, n57.fFin, 0);
		n43.codigo = "11"; //codigo de cabecera n43
		n43.entidad = n57.entidad; //misma entidad que n57
		n43.oficina = "6661"; //puede requerir tabla de asociacion
		n43.cuenta = "0"; //fijo segun campo anterior
		n43.debe = "2"; //default = haber
		n43.divisa = "978"; //codigo euro en n43
		n43.modalidad = "3"; //fijo salvo sorolla
		n43.nombre = "UPCT"; //nombre por defecto
		n57.data.forEach(function(r) {
			var fila = $.extend({ codigo: "22" }, r);
			fila.fOperacion = fila.fValor = r.fCobro;
			fila.debe = (r.anulacion == "1") ? "1" : "2"; //debe = 1 / haber = 2
			fila.concepto3 = " "; //concepto3 = whitespaces only
			//concepto4 = D1 + D2 + J2 + G (hasta 38 posiciones espacios)
			fila.concepto4 = r.emisor + r.sufijo + r.ref1 + r.idCobro;
			n43.data.push(fila); //add new object
		});
		n43.numrows = n57.numrows;
		return this;
	};

	this.n57SantanderToN43 = function() {
		n57ResetStats();
		n57.data = n57.data.filter(function(fila) { return (fila.sufijo != "000") }).each(n57Row60);
		return this.tr57to43();
	};

	this.n43Fetch = function() {
		if (!n43.numrows) return ""; //hay norma 43?
		var rows = []; //lines container to join
		var nApuntesDebe, totalDebe, nApuntesHaber, totalHaber;
		nApuntesDebe = totalDebe = nApuntesHaber = totalHaber = 0;
		rows.push([n43.codigo, n43.entidad, n43.oficina, n43.cuenta.lpad(10), 
				dfN43(n43.fInicio), dfN43(n43.fFin), n43.debe, nfN43(n43.inicial),
				n43.divisa, n43.modalidad, n43.nombre.rput(26 + 3)]); //3 spaces free
		n43.data.forEach(function(fila) {
			var isDebe = (fila.debe == "1");
			nApuntesDebe += +isDebe;
			totalDebe += isDebe ? (fila.importe * -1) : 0;
			nApuntesHaber += +isDebe;
			totalHaber += isDebe ? 0 : fila.importe;
			rows.push([fila.codigo, "    ", fila.oficina, dfN43(fila.fOperacion), dfN43(fila.fValor), 
					fila.comun, fila.propio, fila.debe, nfN43(fila.importe), fila.documento.lpad(10), 
					fila.ref1.substr(-12).lpad(12), fila.ref2.lpad(16)]);
			fila.concepto1 && rows.push(["2301", fila.concepto1.rput(38), fila.concepto2.rput(38)]);
			fila.concepto3 && rows.push(["2302", fila.concepto3.rput(38), fila.concepto4.rput(38)]);
			fila.concepto5 && rows.push(["2303", fila.concepto5.rput(38), fila.concepto6.rput(38)]);
			fila.concepto7 && rows.push(["2304", fila.concepto7.rput(38), fila.concepto8.rput(38)]);
			fila.concepto9 && rows.push(["2305", fila.concepto9.rput(38), fila.concepto10.rput(38)]);
		});
		rows.push(["33", n43.entidad, n43.oficina, n43.cuenta.lpad(10), 
				nApuntesDebe.lpad(5), nfN43(totalDebe), nApuntesHaber.lpad(5), nfN43(totalHaber),
				"2", nfN43(n43.inicial + totalHaber - totalDebe), n43.divisa, "    "]);
		rows.length && rows.push(["88", "999999999999999999", rows.length.lpad(6), "".rput(54)]);
		return rows.map(function(row) { return row.join(""); }).join("\n");
	};

	var factory = { n19: n19, n43: n43, n57: n57 };
	this.references = function() { return referencias; };
	this.n19 = function() { return n19; };
	this.n43 = function() { return n43; };
	this.n57 = function() { return n57; };
	this.sizeN19 = function() { return n43.data.length; };
	this.sizeN43 = function() { return n43.data.length; };
	this.sizeN57 = function() { return n57.data.length; };
	this.get = function(id) { return id ? factory[id] : factory; };
	this.getTpv = function(row) { return row.concepto5 || (row.concepto2 && row.concepto2.split(/\W+/)[1]); };
	this.isConciliable = function(row) { return !row.ji || !row.ji.startsWith(NC); };
	this.save = function() { sessionStorage.rf = JSON.stringify(factory); return this; };
	this.load = function() {
		if (!sessionStorage.rf)
			return this; //nada que cargar
		try {
			factory = JSON.parse(sessionStorage.rf);
			n19 = factory.n19;
			n43 = factory.n43;
			n57 = factory.n57;

			if (n19.files) {
				n19.fecha = n19.fecha.toDateTime();
				n19.data.forEach(function(fila) {
					fila.fOperacion = fila.fOperacion.toDateTime();
					fila.fCobro = fila.fCobro.toDateTime();
				});
			}

			if (n43.files) {
				n43.fInicio = n43.fInicio.toDateTime();
				n43.fFin = n43.fFin.toDateTime();
				n43.data.forEach(function(fila) {
					fila.fOperacion = fila.fOperacion.toDateTime();
					fila.fValor = fila.fValor.toDateTime();
					fila.fCobro = fila.fCobro.toDateTime();
				});
			}

			if (n57.files) {
				n57.fInicio = n57.fInicio.toDateTime();
				n57.fFin = n57.fFin.toDateTime();
				n57.data.forEach(function(fila) {
					fila.fOperacion = fila.fOperacion.toDateTime();
					fila.fCobro = fila.fCobro.toDateTime();
				});
			}
		} catch(e) {}
		return this;
	};

	this.assign = function(obj) {
		obj.n19 = obj.n19 || n19;
		Object.assign(obj.n19, n19);
		obj.n43 = obj.n43 || n43;
		Object.assign(obj.n43, n43);
		obj.n57 = obj.n57 || n57;
		Object.assign(obj.n57, n57);
		return this;
	};

	this.reset = function() {
		referencias.reset();
		factory.n19 = n19Reset();
		factory.n43 = n43Reset();
		factory.n57 = n57Reset();
		delete sessionStorage.rf;
		return this;
	};
};
