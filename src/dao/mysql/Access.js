
module.exports = function(bd) {
	this.findById = function(id) { //find by pk
		return bd.query("select * from access where id_access=" + id);
	};
	this.findByTabla = function(tabla, idTabla, idUsu, idGrupo) { //find by uk
		return bd.query("select * from access where tabla='" + tabla + "' and id_tabla=" + idTabla + " and id_usuario=" + idUsu + " and id_grupo=" + idGrupo);
	};
	this.find = function(data) {
		return this.findById(data.id_access);
	};

	this.findAll = function(data) {
		return bd.query("select * from access");
	};

	this.insertValues = function(tabla, idTabla, idUsu, idGrupo, access, mask) {
		var sql = "insert into access (tabla, id_tabla, id_usuario, id_grupo, access, mask) values "
				+ "('" + tabla + "', " + idTabla + ", " + idUsu + ", " + idGrupo + ", " + access + ", " + mask + ")";
		return bd.query(sql);
	};
	this.insert = function(data) {
		return this.insertValues(data.tabla, data.id_tabla, data.id_usuario, data.id_grupo, data.access, data.mask);
	};

	this.updateById = function(id, tabla, idTabla, idUsu, idGrupo, access, mask) {
		var sql = "update access set tabla='" + tabla + "', id_tabla=" + idTabla 
				+ ", id_usuario=" + idUsu + ", id_grupo=" + idGrupo 
				+ ", access=" + access + ", mask=" + mask 
				+ " where id_access=" + id;
		return bd.query(sql);
	};
	this.updateByTabla = function(tabla, idTabla, idUsu, idGrupo, access, mask) {
		var sql = "update access set access=" + access + ", mask=" + mask 
				+ " where tabla='" + tabla + "' and id_tabla=" + idTabla + " and id_usuario=" + idUsu + " and id_grupo=" + idGrupo;
		return bd.query(sql);
	};
	this.update = function(data) {
		return this.updateById(data.id_access, data.tabla, data.id_tabla, data.id_usuario, data.id_grupo, data.access, data.mask);
	};

	this.deleteById = function(id) {
		var sql = "delete from access where id_access=" + id;
		return bd.query(sql);
	};
	this.deleteByTabla = function(tabla, idTabla, idUsu, idGrupo) {
		var sql = "delete from access where tabla='" + tabla + "' and id_tabla=" + idTabla + " and id_usuario=" + idUsu + " and id_grupo=" + idGrupo;
		return bd.query(sql);
	};
	this.delete = function(data) {
		return this.deleteById(data.id_access);
	};
};
