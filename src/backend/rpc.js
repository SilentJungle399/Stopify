import DiscordRPC from "discord-rpc";

const clientId = "900755240532471888";
DiscordRPC.register(clientId);
const rpc = new DiscordRPC.Client({ transport: "ipc" });

rpc.login({ clientId });

rpc.on("connected", () => {
	if (typeof process.argv !== "string") {
		const deeplinkingUrl = process.argv.find((arg) =>
			arg.startsWith("stopify://")
		);
		socket.emit("joinPartyAttempt", {
			discrim: rpc.user.discriminator,
			pfp:
				"https://cdn.discordapp.com/avatars/" +
				rpc.user.id +
				"/" +
				rpc.user.avatar,
			url: deeplinkingUrl,
			name: rpc.user.username,
			id: rpc.user.id,
		});
	}
});

export default rpc;
