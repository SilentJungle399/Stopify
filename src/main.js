import Vue from "vue";
import App from "./App.vue";
import router from "./handlers/router.js";
import io from "socket.io-client";
import VueSocketIO from "vue-socket.io";
import NProgress from "nprogress";
import Vuex from "vuex";
import session from "@/plugins/session.js";

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
Vue.use(session);

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		queue: [],
		ipc: ipcRenderer,
		tab: "queue",
		current: {
			audio: null,
			data: null,
		},
		progress: 0,
	},
	mutations: {
		progInc(state, val) {
			state.progress = val;
		},
		newQueueSong(state, track) {
			state.queue.push(track);
		},
	},
});

Vue.config.productionTip = true;

NProgress.start();

new Vue({
	render: (h) => h(App),
	router: router,
	store: store,
}).$mount("#app");
