import { app } from "electron";
import io from "socket.io-client";
const socket = io("https://stopify.silentjungle.tk");

socket.on("newMemberJoin", (data) => {
	app.win.webContents.send("newMemberJoin", data);
});

socket.on("newPartySongPlayed", (data) => {
	app.win.webContents.send("urlReqResult", data);
});

socket.on("timeUpdateEvent", (data) => {
	app.win.webContents.send("timeUpdateEvent", data);
});

export default socket;
