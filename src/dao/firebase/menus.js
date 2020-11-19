
//Menu DAO
module.exports = function(db) {
	let publicMenu = []; //cache for application level

	function fnReloadPublicMenu() { //mask 33=100001
		//return query("select m.*, null id_usuario, mask mu_mask from menus m where ((mask & 33) = 33) order by orden").then(results => {
		publicMenu.splice(0); //clear previous cache
		db.collection("menus").orderBy("orden").get().then(snapshot => {
			snapshot.forEach(doc => publicMenu.push(doc.data()));
		});
	}
	function fnFindPublicMenu() {
		return new Promise(function(resolve, reject) {
			return publicMenu ? resolve(publicMenu) : fnReloadPublicMenu();
		});
	}

	this.findAll = function() { return db.collection("menus").orderBy("orden"); } //"select * from menus order by orden"); };
	this.findById = function(id) { return query("select * from menus where id_menu = ?", [id]); };
	this.findByUser = function(id) { return query("select * from v_menus where (id_usuario = ?) or ((mu_mask & 1) = 1) order by orden", [id]); };
	this.findPublic = fnFindPublicMenu;

	this.insert = function(id_padre, nombre, accion, orden, mask, fecha) {
		return db.collection("menus").doc().set({ id_padre, nombre, accion, orden, mask, fecha });
	}
	this.update = function(id, id_padre, nombre, acc, orden, mask, fecha) {
		return db.collection("menus").doc().set({ id, id_padre, nombre, accion, orden, mask, fecha });
	}
	this.save = function(id, padre, nombre, acc, orden, mask, fecha) {
		return id ? this.update(id, padre, nombre, acc, orden, mask, fecha)
				: this.insert(padre, nombre, acc, orden, mask, fecha);
	}
	this.delete = function(id) {
		db.collection("menus").doc(id).delete();
	}

	//Initialize module
	fnReloadPublicMenu();
}
