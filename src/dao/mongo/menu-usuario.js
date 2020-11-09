
//Menu DAO
module.exports = function(query) {
	function getPadre(id) {
		return query("select * from menus where id_menu = ?", [id]).then(results => {
			results.length == 0
		});
	}

	this.findAll = function() { return query("select * from menu_usuario"); };
	this.findById = function(id) { return query("select * from menu_usuario where id_menu_usuario = ?", [id]); };
	this.findByUser = function(id) { return query("select * from menu_usuario where id_usuario = ?", [id]); };

	this.insert = function(menu, usuario, mask) {
		let sql = "INSERT INTO `company`.`menu_usuario` (`id_menu`, `id_usuario`, `mask`) VALUES (?, ?, ?)";
		return query(sql, [menu, usuario, mask]);
	}
	this.insertUsuarios = function(menu, usuarios, mask) {
		let sql = "INSERT INTO `company`.`menu_usuario` (`id_menu`, `id_usuario`, `mask`) "
				+ "SELECT distinct ?, u.id_usuario, ? "
				+ "FROM company.usuarios u left join menu_usuario mu on (u.id_usuario = mu.id_menu) "
				+ "WHERE u.id_usuario in (?) and ((mu.id_menu is null) or (mu.id_menu <> ?))";
		return query(sql, [menu, mask, usuarios.join(","), menu]).then(result => getPadre(menu));
	}
	this.update = function(id, menu, usuario, mask) {
		let sql = "UPDATE `company`.`menu_usuario` SET `id_menu` ?, `id_usuario` = ?, `mask` = ? WHERE `id_menu_usuario` = ?";
		return query(sql, [menu, usuario, mask, id]);
	}
	this.save = function(id, menu, usuario, mask) {
		return id ? this.update(id, menu, usuario, mask) : this.insert(menu, usuario, mask);
	}
	this.delete = function(id) {
		return query("DELETE FROM `company`.`menu_usuario` WHERE id_menu_usuario = ?",  [id]);
	}
};
