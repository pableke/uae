
//Menu DAO
module.exports = function(db, menus) {
	let tMu, publicMenu; //tabla menu-usuario + public menu-cache

	function fnReloadPublicMenu() { //mask 33=100001
		publicMenu = menus.filter(menu => ((menu.mask & 33) == 33));
	}

	menus.findPublic = () => publicMenu;
	menus.findByUser = (id) => { //simulate join
		let mu = tMu.filter(mu => (mu.id_usuario == id));
		let result = menus.filter(menu => {
			let join = mu.find(mu => ((mu.id_menu == menu._id) && ((mu.mask & 1) == 1)));
			menu.mu_mask = (join && join.mask) || menu.mask;
			return ((menu.mu_mask & 1) == 1);
		});
		return [...result]; //clone menus
	}

	// Update table settings
	const fnCommit = menus.commit; //intercept commit => force reload public menus
	menus.commit = function() { return fnCommit().then(fnReloadPublicMenu) };

	menus.each(m => { m.mu_mask = m.mask; });
	menus.findAll().sort((a, b) => (a.orden - b.orden)); //order menus

	fnReloadPublicMenu();
	db.get("menu-usuario").then(table => { tMu = table; });
	return menus;
}
