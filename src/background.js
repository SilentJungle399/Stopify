import { app, BrowserWindow, Menu } from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import menu from "./backend/menu";
import rpc from "./backend/rpc";
import socket from "./backend/socket";
import "./backend/ipcHandler";

app.rpc = true;
const isDevelopment = process.env.NODE_ENV !== "production";

app.setAsDefaultProtocolClient("stopify");

function logEverywhere(s) {
	console.log(s);
	if (app.win && app.win.webContents) {
		app.win.webContents.executeJavaScript(`console.log("${s}")`);
	}
}

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

	Menu.setApplicationMenu(menu);
	win.setMenu(menu);

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
	} else {
		win.loadURL(`file://${__dirname}/index.html`);
	}

	app.win = win;
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on("second-instance", (e, argv) => {
		// Someone tried to run a second instance, we should focus our window.
		if (app.win) {
			if (app.win.isMinimized()) app.win.restore();
			app.win.focus();
		}

		if (process.platform !== "darwin") {
			if (typeof argv !== "string") {
				const deeplinkingUrl = argv.find((arg) => arg.startsWith("stopify://"));
				socket.emit("joinPartyAttempt", {
					discrim: rpc.user.discriminator,
					pfp:
						"https://cdn.discordapp.com/avatars/" +
						rpc.user.id +
						"/" +
						rpc.user.avatar,
					url: deeplinkingUrl,
					id: rpc.user.id,
					name: rpc.user.username,
				});
			}
		}
	});
}

app.on("ready", async (e) => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			console.error("Vue Devtools failed to install:", e.toString());
		}
	}
	createWindow();
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
