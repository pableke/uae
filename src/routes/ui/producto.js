
const { ipcMain } = require("electron");
const products = require("../../controllers/ui/producto");

// Catch products events
ipcMain.on("product:search", function(ev, args) {
	ev.reply("product:search", products.search(args));
});
ipcMain.on("product:get", function(ev, id) {
	ev.reply("product:get", products.getById(id));
});
ipcMain.on("product:save", function(ev, args) {
	let data = products.save(args._id, args.name, args.price, args.info);
	data.errno ? ev.reply("product:save-error", data) : ev.reply("product:save-ok");
});
ipcMain.on("product:delete", function(ev, id) {
	products.deleteById(id).then(table => {
		showNotification("Elemento eliminado correctamente");
	});
});
