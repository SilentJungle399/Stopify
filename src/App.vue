<template>
	<div id="app">
		<div class="supported" v-if="!unsupported">
			<!-- Application here -->
			<Notification :msg="notif"></Notification>
			<ServerInfo></ServerInfo>
			<SearchComp></SearchComp>
			<SidePane></SidePane>
			<MainArea></MainArea>
			<PlayerSection :preTrack="track"></PlayerSection>
		</div>
		<div v-else class="unsupported">
			<h3>Unfortunately, your device is not supported for the webapp.</h3>
		</div>
	</div>
</template>

<script>
import Notification from "@/components/utils/Notification.vue";
import progress from "@/handlers/progress.js";
import ServerInfo from "@/components/BaseComp/ServerInfo.vue";
import SearchComp from "@/components/BaseComp/SearchComp.vue";
import SidePane from "@/components/BaseComp/SidePane.vue";
import MainArea from "@/components/BaseComp/MainArea.vue";
import PlayerSection from "@/components/BaseComp/PlayerSection.vue";

export default {
	name: "App",
	components: {
		Notification,
		ServerInfo,
		SearchComp,
		SidePane,
		MainArea,
		PlayerSection,
	},
	data() {
		return {
			notif: null,
			curnotif: null,
			unsupported: false,
			loggedin: false,
			auexists: false,
			track: null,
		};
	},
	methods: {
		makealert(msg) {
			if (this.curnotif) {
				clearTimeout(this.curnotif);
				this.curnotif = null;
			}
			this.notif = msg;
			document.getElementById("notif").style.zIndex = 1;
			document.getElementById("notif").style.opacity = 1;
			this.curnotif = setTimeout(function () {
				document.getElementById("notif").style.opacity = 0;
				document.getElementById("notif").style.zIndex = 0;
			}, 2500);
		},
		checksize() {
			if (window.innerWidth > 1000) {
				if (this.unsupported) {
					progress.start("page");
				}
				this.unsupported = false;
				setTimeout(() => progress.done(), 2000);
			} else {
				this.unsupported = true;
			}
		},
		random(length, randomString = "") {
			randomString += Math.random().toString(36).substr(2, length);
			if (randomString.length > length) return randomString.slice(0, length);
			return this.random(length, randomString);
		},
	},
	mounted() {
		// if (!this.loggedin) {
		// 	if (this.$route.path === "/callback") {
		// 		this.$socket.emit("validateCallback", {
		// 			code: this.$route.query.code
		// 		})
		// 	} else {
		// 		const token = window.localStorage.getItem("token")
		// 		if (!token) {
		// 			window.location.href = "https://discord.com/api/oauth2/authorize?client_id=740568766198448190&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback&response_type=code&scope=identify"
		// 		}
		// 	}
		// }
		this.$store.state.user = "738362958253522976";
		this.$store.state.tab = "queue";
		this.$store.state.sid = this.random(40);
		this.$socket.emit("userAuth", {
			user: this.$store.state.user,
			sid: this.$store.state.sid,
		});
		if (window.innerWidth > 1000) {
			this.unsupported = false;
			progress.done();
		} else {
			this.unsupported = true;
			progress.done();
		}

		if (this.$route.fullPath === "/") {
			progress.done();
		}
	},
	sockets: {
		callbackValidation(data) {
			if (data.valid) {
				window.localStorage.set("token", data.token);
				const add = "";
				if (this.$route.path !== `/${add}`) {
					this.$route.push({
						path: `/${add}`,
					});
				}
			} else {
				const add = "login/404";
				if (this.$route.path !== `/${add}`) {
					this.$route.push({
						path: `/${add}`,
					});
				}
			}
		},
		playerUpdate(data) {
			console.log(`Recieved:`, "playerUpdate", data);
			this.$store.state.guild = data.guild;
			this.$store.state.player = data.player.status;
			this.$store.state.queue = data.player.queue;
			this.$store.state.vc = data.voice;
			this.track = data.player.song;
		},
	},
	created() {
		window.addEventListener("resize", this.checksize);
	},
	destroyed() {
		window.removeEventListener("resize", this.checksize);
	},
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Rubik&display=swap");

body {
	background: #1b1b1b;
	color: rgb(255, 255, 255);
	font-family: "Rubik", sans-serif;
}

.progressing {
	height: 100%;
	position: absolute;
	width: 100%;
	top: 0;
	left: 0;
	background-color: #151516;
}
::-webkit-scrollbar {
	width: 7px;
	height: 7px;
}

/* Track */
::-webkit-scrollbar-track {
	background: rgb(0 26 26 / 1);
	border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: rgb(0 38 38 / 1);
	border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
	background: rgb(0, 0, 0);
}
</style>
