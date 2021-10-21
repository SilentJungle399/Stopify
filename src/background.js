import {
	app,
	protocol,
	BrowserWindow,
	ipcMain,
	nativeTheme,
	globalShortcut,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import ytsr from "ytsr";
import ytdl from "ytdl-core";

const isDevelopment = process.env.NODE_ENV !== "production";

protocol.registerSchemesAsPrivileged([
	{ scheme: "stopify", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
	const win = new BrowserWindow({
		title: "Spotify",
		minWidth: 1200,
		minHeight: 700,
		webPreferences: {
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
		},
	});

	win.setMenu(null);

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
	} else {
		createProtocol("stopify");
		win.loadURL("stopify://./index.html");
	}

	app.win = win;
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

ipcMain.on("songSearchReq", (event, arg) => {
	ytsr(arg.song, {
		limit: 20,
	}).then((result) => {
		event.reply("searchResult", result);
	});
});

ipcMain.on("playUrlReq", (event, arg) => {
	ytdl.getInfo(arg.song).then((result) => {
		event.reply("urlReqResult", result);
	});
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			console.error("Vue Devtools failed to install:", e.toString());
		}
	}
	createWindow();

	globalShortcut.register("CommandOrControl+Shift+P", () => {
		app.win.webContents.openDevTools();
	});

	globalShortcut.register("CommandOrControl+R", () => {
		app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
		app.exit(0);
	});
});

if (isDevelopment) {
	if (process.platform === "win32") {
		process.on("message", (data) => {
			if (data === "graceful-exit") {
				app.quit();
			}
		});
	} else {
		process.on("SIGTERM", () => {
			app.quit();
		});
	}
}
