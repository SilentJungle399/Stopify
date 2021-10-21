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
import DiscordRPC from "discord-rpc";

const clientId = "900755240532471888";
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: "ipc" });

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

rpc.on("connected", () => {
	console.log("Connected to ", rpc.user.username);
});

ipcMain.on("rpcReq", (event, args) => {
	event.reply("rpcUserConnected", {
		username: rpc.user.username,
		discrim: rpc.user.discriminator,
		avatar:
			"https://cdn.discordapp.com/avatars/" +
			rpc.user.id +
			"/" +
			rpc.user.avatar,
	});
});

ipcMain.on("rpcUpdate", (event, args) => {
	rpc.setActivity({
		state: args.channel,
		details: args.title,
		endTimestamp: new Date(args.end),
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
	rpc.login({ clientId });

	globalShortcut.register("CommandOrControl+Shift+/", () => {
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
