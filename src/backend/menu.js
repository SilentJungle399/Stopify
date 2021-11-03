import { Menu, app } from "electron";

const menu = Menu.buildFromTemplate([
	{
		label: "App",
		submenu: [
			{
				label: "Open devTools",
				click() {
					app.win.webContents.openDevTools();
				},
			},
			{
				label: "Restart",
				click() {
					app.relaunch();
					app.exit();
				},
			},
			{
				label: "Exit",
				click() {
					app.quit();
				},
			},
		],
	},
	{
		label: "Discord",
		submenu: [
			{
				label: "Connect / Disconnect",
				click() {
					app.rpc = !app.rpc;
				},
			},
		],
	},
]);

export default menu;
