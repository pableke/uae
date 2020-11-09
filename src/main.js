
const url = require("url"); //url parser
const path = require("path"); //file and directory paths
const env = require("dotenv").config(); //load env const
const dao = require("./dao/Factory"); //bd factory

const { app, BrowserWindow, Notification, Menu, ipcMain } = require("electron");

// Reload in Development environment
if (process.env.NODE_ENV !== "production") {
	//autoreload changes after saving
	require("electron-reload")(__dirname, {
		electron: path.join(__dirname, "../node_modules", ".bin", "electron")
	});
}

let mainWindow;
const ICON_PATH = path.join(__dirname, "public/img/upct-azul-logo.png");
const i18n = { //aviable languages list
	"es": require("./i18n/es.js"), 
	"en": require("./i18n/en.js")
};

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1000, height: 600,
		icon: ICON_PATH,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});

	//carga el index.html de la aplicación
	mainWindow.loadFile(path.join(__dirname, "ui/producto.html"));
	//abre las herramientas de desarrollo (DevTools)
	//mainWindow.webContents.openDevTools();
}

// Settings
dao.open(); //init dao factory
app.allowRendererProcessReuse = true;
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

module.exports = {
	producto: require("./controllers/producto"),
	showNotification: function(title, text) {
		let notification = new Notification({ title: title, body: text, icon: ICON_PATH });
		notification.show(); //show current notification
		return notification;
	}
};
