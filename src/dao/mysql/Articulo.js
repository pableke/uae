
module.exports = function(bd) {
	this.find = function(attr) {
	};

	this.findall = function(attr) {
		return bd.query("select SQL_CALC_FOUND_ROWS * from v_articulos order by nombre");
	};

	this.navigate = function(root) { return bd.query(root, sqlFilter); };
	this.filter = function(attr) {
		var fnError = attr.root.isAjax() ? attr.root.err : attr.errAndRemoveNode;
		return bd.query(attr.root, sqlFilter, "articulo").then(attr.each).catch(fnError);
	};

	this.insertValues = function(idFam, codigo, precio1, precio2, stock, stock_min, estado, prioridad, orden, mask, fCreacion, files) {
		var sql = "insert into articulo (id_familia, codigo, precio1, precio2, stock, stock_min, estado, prioridad, orden, mask, f_creacion) values "
				+ "(" + idFam + ", '" + codigo + "', " + precio1 + ", " + precio2 + ", " + stock + ", " + stock_min + ", " + estado + ", " + prioridad 
				+ ", " + orden + ", " + mask + ", cast('" + fCreacion.toISOString() + "' as datetime))"; //cast('string isodate format' as datetime)
		return bd.query(sql).then(function(result) {
			return bd.ficheros.insertValues("articulo", result.insertId, files);
		});
	};
	this.insert = function(node, data, files) {
		return this.insertValues(data.id_familia, data.codigo, data.precio1, data.precio2, data.stock, data.stock_min, 
								data.estado, data.prioridad, data.orden, data.mask, data.f_creacion, files);
	};

	this.update = function(node, fields, files) {
		var sql = "update" + sqlFields + " where id_articulo = @id_articulo;".format(fields);
		return bd.query(node, sql).then(function(result) {
			fields.objeto = "articulos";
			return bd.ficheros.insert(node, fields, files);
		});
	};
	this.save = function(node, fields, files) {
		return fields.id_articulo ? this.update(node, fields, files) : this.insert(node, fields, files);
	};

	this.delete = function(node) {
		var sql = "delete from ficheros where tabla = 'articulo' and id_tabla = @id_articulo;" //delete all foreing files
				+ "delete from articulos where id_articulo = @id_articulo;"; //delete articulo object
		return bd.query(node, sql.format(node.data));
	};
};
