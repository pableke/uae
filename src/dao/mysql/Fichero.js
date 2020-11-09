
var fs = require("fs"); //file system
//var config = require("../../lib/config"); //default server config

function fnVoid() {};

module.exports = function(bd) {
	this.findById = function(id) { //find by pk
		return bd.query("select * from fichero where id_fichero=" + id);
	};
	this.findByTabla = function(tabla, idTabla) { //find by uk
		return bd.query("select * from fichero where tabla='" + tabla + "' and id_tabla=" + idTabla);
	};
	this.find = function(data) {
		return this.findById(data.id_fichero);
	};

	this.findAll = function(attr) {
		return bd.query(attr, "select * from fichero");
	};

	this.insertValues = function(tabla, idTabla, files) {
		var sql = "insert into ficheros (tabla, id_tabla, nombre, ruta, size, mask) values ";
		sql += files.map(function(file) {
			return "('" + tabla + "', " + idTabla + ", '" + file.name + "', '" + file.basename + "', " + file.size + ", 0)";
		}).join(); //default param ","
		return bd.query(sql);
	};
	this.insert = function(data, files) {
		return bd.insertValues(data.tabla, data.id_tabla, files);
	};

	this.main = function(id, tabla, idTabla) {
		var sql = "update fichero set mask = (mask & 8191) where tabla='" + tabla + "' and id_tabla=" + idTabla; //8191=1111111111110
		sql += ";update fichero set mask = (mask | 1) where id_fichero=" + id; //main file
		return bd.query(sql);
	};

	function deleteFile(id, ruta) {
		var sql = "delete from fichero where id_fichero=" + id;
		return bd.query(sql).then(function() {
			fs.unlink(config.dirThumb + ruta, fnVoid); //has thumb?
			fs.unlink(config.dirUpload + ruta, fnVoid); //main file
		});
	};
	this.deleteFile = deleteFile;
	this.deleteById = function(id) {
		return this.findById(id).then(function(result) { deleteFile(result.id_fichero, result.ruta); });
	};
	this.deleteByTabla = function(tabla, idTabla) {
		return this.findByTabla(tabla, idTabla).then(function(result) {
			var sql = "delete from fichero where tabla='" + tabla + "' and id_tabla=" + idTabla;
			bd.query(sql).then(function() { result.forEach(function(file) { fs.unlink(config.dirUpload + result.ruta, fnVoid); }); });
		});
	};
	this.delete = function(data) {
		return this.deleteById(data.id_fichero);
	};
};
