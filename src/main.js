import Vue from "vue";
import App from "./App.vue";
import router from "./handlers/router.js";
import io from "socket.io-client";
import VueSocketIO from "vue-socket.io";
import NProgress from "nprogress";
import Vuex from "vuex";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTimes, faPlay } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
//import { faTimesCircle } from '@fortawesome/free-regular-svg-icons'

Vue.component("fontAws", FontAwesomeIcon);

Vue.use(
	new VueSocketIO({
		connection: io("https://socketio-js-test.asilentjungle.repl.co"),
	})
);

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
			pfp: "/dummy.png",
		},
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
	},
});

ipcRenderer.send("rpcReq", {});
ipcRenderer.on("rpcUserConnected", (event, data) => {
	console.log("Received rpc data: ", data);
	store.commit("rpcData", data);
	startRpc();
});

function startRpc() {
	setInterval(() => {
		if (store.state.current.audio) {
			const retdata = {
				title: store.state.current.data.title,
				channel: store.state.current.data.author.name,
				length: store.state.current.data.lengthSeconds,
				end:
					Date.now() +
					(parseInt(store.state.current.data.lengthSeconds) -
						store.state.current.audio.currentTime) *
						1000,
				start: store.state.current.start,
			};
			console.log("Emitting: ", "rpcUpdate", retdata);
			ipcRenderer.send("rpcUpdate", retdata);
		}
	}, 5000);
}

Vue.config.productionTip = true;

NProgress.start();

new Vue({
	render: (h) => h(App),
	router: router,
	store: store,
}).$mount("#app");
