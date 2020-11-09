
//Menu DAO
module.exports = function(query) {
	let publicMenu; //cache for application level

	function fnReloadPublicMenu() { //mask 33=100001
		return query("select m.*, null id_usuario, mask mu_mask from menus m where ((mask & 33) = 33) order by orden").then(results => {
			publicMenu = results;
		});
	}
	function fnFindPublicMenu() {
		return new Promise(function(resolve, reject) {
			return publicMenu ? resolve(publicMenu) : fnReloadPublicMenu();
		});
	};

	this.findAll = function() { return query("select * from menus order by orden"); };
	this.findById = function(id) { return query("select * from menus where id_menu = ?", [id]); };
	this.findByUser = function(id) { return query("select * from v_menus where (id_usuario = ?) or ((mu_mask & 1) = 1) order by orden", [id]); };
	this.findPublic = fnFindPublicMenu;

	this.insert = function(padre, nombre, acc, orden, mask, fecha) {
		let sql = "INSERT INTO `company`.`menus` (`id_padre`, `nombre`, `accion`, `orden`, `mask`, `f_creacion`) VALUES (?, ?, ?, ?, ?, ?)";
		return query(sql, [padre, nombre, acc, orden, mask, fecha]).then(fnReloadPublicMenu);
	}
	this.update = function(id, padre, nombre, acc, orden, mask, fecha) {
		let sql = "UPDATE `company`.`menu_usuario` SET `id_menu` = ?, `id_usuario` = ?, `mask` = ? WHERE `id_menu_usuario` = ?";
		return query(sql, [padre, nombre, acc, orden, mask, fecha, id]).then(fnReloadPublicMenu);
	}
	this.save = function(id, padre, nombre, acc, orden, mask, fecha) {
		return id ? this.update(id, padre, nombre, acc, orden, mask, fecha)
				: this.insert(padre, nombre, acc, orden, mask, fecha);
	}
	this.delete = function(id) {
		return query("DELETE FROM `menus` WHERE id_menu = ?",  [id]).then(fnReloadPublicMenu);
	}

	//Initialize module
	fnReloadPublicMenu();
}
