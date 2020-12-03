
/**
 * @file main.js start descktop application with Electron
 * @author Pablo Rosique Vidal
 * @see <a href="https://github.com/pableke/uae">UAE</a>
 */

const fs = require("fs"); //file system
const url = require("url"); //url parser
const path = require("path"); //file and directory paths
const env = require("dotenv").config(); //load env const
const dao = require("./dao/Factory"); //bd factory
const valid = require("validate-box"); //validators

const { app, /*protocol,*/ BrowserWindow, Menu, ipcMain, Notification } = require("electron");

let mainWindow;
const ICON_PATH = path.join(__dirname, "public/img/upct-azul-logo.png");
const i18n = { //aviable languages list
	"es": require("./i18n/es.js"), 
	"en": require("./i18n/en.js")
};

function createWindow() {
	// Set language
	valid.setI18n("es");
	valid.mb.setMessages(i18n.es);

	/*protocol.registerFileProtocol("file", (request, callback) => {
		const pathname = decodeURI(request.url.replace("file:///", ""));
		callback(pathname.split("?")[0]); //remove parameters
	});*/

	mainWindow = new BrowserWindow({
		width: 1000, height: 600, icon: ICON_PATH,
		webPreferences: {
			webSecurity: true, //required for file protocol (default true)
			nodeIntegration: true,
			enableRemoteModule: false
		}
	});

	// Load application index.html
	let file = path.join(__dirname, "ui/producto.html");
	mainWindow.loadURL(url.format({ pathname: file, protocol: "file", slashes: true }));
	//mainWindow.loadURL("data:text/html;charset=utf-8," + fs.readFileSync(file).toString());
	//mainWindow.loadFile(file);

	// Build and Insert menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}

// Settings
dao.open(); //init dao factory
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On macOS it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// Create menu template
const mainMenuTemplate = [
	// Each object is a dropdown
	{
		label: "File",
		submenu: [
			{
				label: "Quit",
				accelerator: (process.platform == "darwin") ? "Command+Q" : "Ctrl+Q",
				click() { app.quit(); }
			}
		]
	}
];

// Reload in Development environment
if (process.env.NODE_ENV !== "production") {
	//autoreload changes after saving
	require("electron-reload")(__dirname, {
		electron: path.join(__dirname, "../node_modules", ".bin", "electron")
	});

	// Add developer tools option if in dev
	mainMenuTemplate.push({
		label: "Developer Tools",
		submenu: [
			{ role: "reload" },
			{
				label: "Toggle DevTools",
				accelerator: (process.platform == "darwin") ? "Command+I" : "Ctrl+I",
				click(item, focusedWindow) { focusedWindow.toggleDevTools(); }
			}
		]
	});
}

function showNotification(body) { (new Notification({ title: "Electron App", body, icon: ICON_PATH })).show(); }
ipcMain.on("show", function(ev, body) { showNotification(body); });

// Catch products events
const products = require("./controllers/producto");
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
