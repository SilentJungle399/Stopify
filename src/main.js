import Vue from "vue";
import App from "./App.vue";
import NProgress from "nprogress";
import Vuex from "vuex";

import { ipcRenderer } from "electron";

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		queue: [],
		ipc: ipcRenderer,
		tab: "queue",
		current: {
			audio: null,
			data: null,
			start: null,
		},
		progress: 0,
		user: {
			name: "Discord not detected",
			discrim: "0000",
			pfp: "https://cdn.discordapp.com/attachments/542672943872999424/903177673797402654/dummy.png",
		},
		controls: {
			shuffle: 0,
			repeat: 0,
			paused: true,
		},
		joinedParty: false,
		members: [],
	},
	mutations: {
		progInc(state, val) {
			state.progress = val;
		},
		newQueueSong(state, track) {
			state.queue.push(track);
		},
		rpcData(state, data) {
			state.user.name = data.username;
			state.user.discrim = data.discrim;
			state.user.pfp = data.avatar;
		},
		switchTab(state, val) {
			state.tab = val;
		},
		addMember(state, data) {
			state.members.push(data);
		},
	},
});

ipcRenderer.on("newMemberJoin", (e, d) => {
	store.commit("addMember", d);
	if (store.state.current.audio) {
		ipcRenderer.send("memberPlayerUpdate", {
			id: d.id,
			data: store.state.current.data,
			current: store.state.current.audio.currentTime,
			start: Date.now(),
		});
	}
	console.log("Received: newMemberJoin", d);
});

ipcRenderer.send("rpcReq", {});
ipcRenderer.on("rpcUserConnected", (event, data) => {
	store.commit("rpcData", data);
	startRpc();
});

ipcRenderer.on("connUpdate", (event, data) => {
	store.commit("rpcData", data);
});

function startRpc() {
	setInterval(() => {
		const retdata = store.state.current.audio
			? {
					audio: true,
					title: store.state.current.data.title,
					channel: store.state.current.data.author.name,
					length: store.state.current.data.lengthSeconds,
					end:
						Date.now() +
						(parseInt(store.state.current.data.lengthSeconds) -
							store.state.current.audio.currentTime) *
							1000,
					start: store.state.current.start,
					members: store.state.members,
					current: store.state.current.audio.currentTime,
			  }
			: {
					audio: false,
					members: store.state.members,
					current: 0,
			  };
		ipcRenderer.send("updateEvent", retdata);
	}, 1000);
}

ipcRenderer.on("timeUpdateEvent", (e, d) => {
	if (
		store.state.current.audio.currentTime - d.current > 2 ||
		store.state.current.audio.currentTime - d.current < -2
	) {
		console.log("Received: timeUpdateEvent", d);
		store.state.current.audio.currentTime = d.current;
	}
});

Vue.config.productionTip = true;

NProgress.start();

new Vue({
	render: (h) => h(App),
	store: store,
}).$mount("#app");
