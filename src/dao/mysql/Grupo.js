
module.exports = function(bd) {
	this.find = function(attr) {
		return bd.query(attr, "select * from v_grupo where id_grupo = :key");
	};

	this.foreing = function(attr) {
		return bd.query(attr, "select * from v_grupo_usuario where #reference = :fk")
						.then(attr.next)
						.catch(attr.msgError);
	};

	this.findall = function(attr) {
		return bd.query(attr.root, "select * from v_grupo order by nombre")
						.then(attr.each)
						.catch(attr.msgError);
	};

	this.filter = function(attr) {
		var sql = "select SQL_CALC_FOUND_ROWS * from v_grupo where "
				+ "(cmplike(nombre, :f)) and cmplike(nombre, :fn) "
				+ "#order limit :index,:length";
		return bd.query(attr, sql);
	};

	this.insert = function(attr) {
		return bd.query(attr, "update grupo set nombre = :nombre where id_articulo = :key");
	};

	this.update = function(attr) {
		return bd.query(attr, "update grupo set nombre = :nombre where id_articulo = :key");
	};
};
