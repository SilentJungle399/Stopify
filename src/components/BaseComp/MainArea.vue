<template>
	<div @dragover="dragover" class="mainarea">
		<button
			class="backbutton"
			v-show="tab !== 'queue'"
			@click="switchTab('queue')"
		>
			<left></left>
		</button>
		<div class="scrollarea" style="width: 100%" v-if="tab === 'search'">
			<div class="searchrestrack" :key="track.url" v-for="track in searchres">
				<img
					:src="`https://img.youtube.com/vi/${
						track.url.split(/\?v=/g)[1]
					}/0.jpg`"
					alt=""
					class="searchresthumbnail"
				/>
				<div class="songdiv">
					<span class="searchresinfoname">{{ track.title }}</span>
					<span class="searchresinfochannel">{{ track.author.name }}</span>
				</div>
				<div class="searchrescontrols">
					<span class="searchresaudiocontrolcontainer" @click="play(track)">
						<playicon class="searchresaudiocontrol"></playicon>
					</span>
				</div>
			</div>
		</div>
		<div class="scrollarea" style="width: 100%" v-else-if="tab === 'queue'">
			<div
				:id="queue.indexOf(track)"
				@dragstart="dragstart"
				@dragend="dragend"
				class="searchrestrack draggable"
				:key="track.url"
				v-for="track in $store.state.queue"
				draggable="true"
			>
				<img
					:src="`https://img.youtube.com/vi/${
						track.url.split(/\?v=/g)[1]
					}/0.jpg`"
					alt=""
					class="searchresthumbnail"
				/>
				<div class="songdiv">
					<span class="searchresinfoname">{{ track.title }}</span>
					<span class="searchresinfochannel">{{ track.author.name }}</span>
				</div>
				<div class="searchrescontrols">
					<span class="searchresaudiocontrolcontainer" @click="play(track)"
						><playicon class="searchresaudiocontrol"></playicon
					></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import progress from "@/handlers/progress.js";
import playicon from "@/assets/svg/Playicon.vue";
import { ipcRenderer } from "electron";
import left from "@/assets/svg/left-arrow.vue";

export default {
	name: "MainArea",
	components: {
		playicon,
		left,
	},
	data() {
		return {
			tab: "queue",
			searchres: [],
			queue: [],
			dragactive: false,
			dragpos: null,
			curdrag: null,
			newpos: null,
		};
	},
	methods: {
		play(track) {
			if (this.$store.state.current.audio) {
				this.$store.commit("newQueueSong", track);
				console.log("Committing:", "newQueueSong", track);
			} else {
				const emitData = {
					song: track.url,
				};
				ipcRenderer.send("playUrlReq", emitData);
				console.log("Emitting:", "playUrlReq", emitData);
			}
		},
		switchTab(tab) {
			this.$store.state.tab = tab;
			this.tab = tab;
		},
		dragover(event) {
			event.preventDefault();
			const draggables = [
				...document.querySelectorAll(".draggable:not(.dragging)"),
			];
			const posArr = draggables.map((item) => item.getBoundingClientRect().y);
			posArr.push(event.clientY);
			posArr.sort();
			const pos = posArr.indexOf(event.clientY);
			const item = this.queue[this.curdrag];
			this.moveElement(item, this.queue.indexOf(item), pos - 1);
		},
		moveElement(elem, from, to) {
			if (from === to) {
				console.log("denied");
				console.log(to);
				console.log(from);
				console.log(this.newpos);
				console.log("--------------------");
				return;
			} else {
				// console.log(`removed from ${from}`)
				this.queue.splice(from, 1);
				this.queue.splice(to, 0, elem);
				// console.log(`placed at ${to}`)
				console.log("approved");
				console.log(to);
				console.log("--------------------");
				this.newpos = to;
				this.curdrag = to;
			}
		},
		dragstart(event) {
			console.log(event);
			this.dragactive = true;
			this.curdrag = parseInt(event.srcElement.id);
			event.srcElement.classList.add("hoiii");
			event.srcElement.style.opacity = "0.5";
		},
		dragend(event) {
			console.log(event);
			this.dragactive = false;
			event.srcElement.style.removeProperty("opacity");
			this.dragpos = null;
			this.curdrag = null;
			const emitData = {
				queue: this.queue.map((item) => item.raw),
				user_id: this.$store.state.user,
				server_id: this.$store.state.guild.id,
			};
			this.$socket.emit("queueEditReq", emitData);
			console.log("Emitting:", "queueEditReq", emitData);
		},
		handleEvents(audio) {
			audio.addEventListener("ended", this.songEnded);
			audio.addEventListener("timeupdate", this.timeUpdate);
			audio.addEventListener("error", this.onerror);
		},
		onerror(e) {
			console.log("Errored:", e);
			console.log("Skipping");
			this.nextSong();
		},
		songEnded(e) {
			this.$store.state.current.audio.removeEventListener(
				"timeupdate",
				this.timeUpdate
			);
			this.$store.state.current.audio.removeEventListener(
				"ended",
				this.songEnded
			);
			this.nextSong();
		},
		timeUpdate(e) {
			this.$store.commit(
				"progInc",
				(this.$store.state.current.audio.currentTime * 100) /
					this.$store.state.current.audio.duration
			);
		},
		nextSong() {
			this.$store.state.current.audio = null;
			this.$store.commit("progInc", 0);
			this.$store.state.current.data = null;

			if (this.$store.state.queue.length > 0) {
				this.play(this.$store.state.queue.shift());
			}
		},
	},

	sockets: {
		newSongSearchReturn(data) {
			console.log("Incoming:", "newSongSearchReturn", data);
			this.searchres = data.tracks;
			this.switchTab("search");
		},
		newQueue(data) {
			console.log("Incoming:", "newQueue", data);
			this.$store.state.queue = data.queue;
			this.queue = data.queue;
		},
		playerUpdate(data) {
			this.queue = data.player.queue;
		},
	},
	watch: {
		$store(after, before) {
			this.queue = this.$store.state.queue;
		},
	},
	mounted() {
		ipcRenderer.on("searchResult", (event, arg) => {
			console.log("Incoming:", "searchResult", arg);
			this.searchres = arg.items.filter((a) => a.type === "video");
			this.switchTab("search");
		});

		ipcRenderer.on("urlReqResult", (event, arg) => {
			console.log("Incoming:", "urlReqResult", arg);
			this.$store.state.current = {
				audio: new Audio(arg.formats[0].url),
				data: arg.videoDetails,
				start: Date.now(),
			};
			this.$store.state.current.audio.play();
			this.handleEvents(this.$store.state.current.audio);
		});
	},
};
</script>

<style>
.mainarea {
	background-color: var(--sections);
	position: absolute;
	top: 125px;
	display: flex;
	padding: 50px 30px 30px 30px;
	right: 0;
	width: calc(100% - 435px - 25px);
	height: calc(100% - 310px);
	border-radius: 50px 0 0 0;
}

.scrollarea {
	overflow-y: auto;
	margin-top: 10px;
}

.draggable {
	cursor: grab;
}

.dragging {
	cursor: grabbing;
}

.backbutton {
	position: absolute;
	top: 15px;
	left: 25px;
	background: none;
	outline: none;
	border: none;
	color: white;
	border-radius: 62px;
	padding: 10px;
	padding-bottom: 7px;
	transition: all 0.5s;
}

.backbutton:hover {
	background: #1c172f;
	cursor: pointer;
}

.searchresthumbnail {
	height: 100px;
}

.searchresinfochannel {
	color: #ffffffc4;
}

.songdiv {
	display: flex;
	padding: 10px;
	flex-direction: column;
}

.searchrestrack {
	padding: 10px 10px 10px 20px;
	border-radius: 10px;
	transition: background 0.5s;
	margin: 10px;
	display: flex;
}

.searchrescontrols {
	margin: auto 50px auto auto;
	opacity: 0;
	transition: opacity 0.5s;
}

.searchrestrack:hover {
	background: #18162b;
}

.searchrestrack:hover > .searchrescontrols {
	opacity: 1;
}

.playpath {
	transition: stroke 0.5s;
}

.searchresaudiocontrol:hover {
	cursor: pointer;
}

.searchresaudiocontrol:hover > .playpath {
	stroke: #626ed8;
}
</style>
