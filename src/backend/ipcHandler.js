import { app, ipcMain } from "electron";
import ytsr from "ytsr";
import ytdl from "ytdl-core";
import rpc from "./rpc";
import socket from "./socket";

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

ipcMain.on("memberPlayerUpdate", (event, args) => {
	ytdl.getInfo(args.data.video_url).then((result) => {
		event.reply("joinFromMid", {
			song: result,
			pos: {
				start: args.start,
				current: args.current,
			},
		});
	});
});

ipcMain.on("rpcReq", (event, args) => {
	event.reply("rpcUserConnected", {
		username: app.rpc && rpc.user ? rpc.user.username : "Discord disconnected",
		discrim: app.rpc && rpc.user ? rpc.user.discriminator : "0000",
		avatar:
			app.rpc && rpc.user
				? "https://cdn.discordapp.com/avatars/" +
				  rpc.user.id +
				  "/" +
				  rpc.user.avatar
				: "https://cdn.discordapp.com/attachments/542672943872999424/903177673797402654/dummy.png",
	});
});

ipcMain.on("secInstTest", (event, data) => {
	socket.emit("joinPartyAttempt", {
		discrim: rpc.user.discriminator,
		pfp:
			"https://cdn.discordapp.com/avatars/" +
			rpc.user.id +
			"/" +
			rpc.user.avatar,
		url: "stopify://join/user/738362958253522976",
		id: rpc.user.id,
		name: rpc.user.username,
	});
});

ipcMain.on("emitPlayedSong", (event, data) => {
	if (!rpc.user) return;

	data.id = rpc.user.id;
	socket.emit("newPartySong", data);
});

ipcMain.on("updateEvent", (event, args) => {
	console.log(args);
	if (args.audio && app.rpc && rpc.user) {
		console.log("e");
		rpc.setActivity({
			conn: app.rpc,
			state: args.channel,
			details: args.title,
			endTimestamp: new Date(args.end),
			buttons: [
				{
					label: "Listen along",
					url: `stopify://join/user/${rpc.user.id}`,
				},
			],
		});
	} else if (rpc.user) {
		rpc.clearActivity();
	}

	if (rpc.user) {
		socket.emit("connUpdate", {
			listening: args.audio,
			userid: rpc.user.id,
			members: args.members ? args.members : [],
			username: rpc.user.username,
			discrim: rpc.user.discriminator,
			pfp:
				"https://cdn.discordapp.com/avatars/" +
				rpc.user.id +
				"/" +
				rpc.user.avatar,
		});

		if (args.members.length > 0 && args.audio) {
			socket.emit("timeUpdateMain", {
				current: args.current,
				members: args.members,
			});
		}
	}

	event.reply("connUpdate", {
		username: app.rpc && rpc.user ? rpc.user.username : "Discord disconnected",
		discrim: app.rpc && rpc.user ? rpc.user.discriminator : "0000",
		avatar:
			app.rpc && rpc.user
				? "https://cdn.discordapp.com/avatars/" +
				  rpc.user.id +
				  "/" +
				  rpc.user.avatar
				: "https://cdn.discordapp.com/attachments/542672943872999424/903177673797402654/dummy.png",
	});
});
