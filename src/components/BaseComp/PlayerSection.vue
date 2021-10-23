<template>
	<div class="playersection">
		<SeekBar
			@seekAttempt="doSeek"
			:draggable="!!$store.state.current.audio"
		></SeekBar>
		<div class="songdata" v-if="$store.state.current.data">
			<table cellspacing="0">
				<tr>
					<td rowspan="2">
						<img
							:src="`https://img.youtube.com/vi/${
								$store.state.current.data.video_url.split(/\?v=/g)[1]
							}/0.jpg`"
							alt=""
							class="currentthumbnail"
						/>
					</td>
					<td>
						<span class="currentsongname">
							{{
								$store.state.current.data.title.length > 40
									? $store.state.current.data.title.substring(0, 40) + "..."
									: $store.state.current.data.title
							}}
						</span>
						<br />
					</td>
				</tr>
				<tr>
					<td>
						<span class="currentsongchannel">{{
							$store.state.current.data.author.name
						}}</span>
					</td>
				</tr>
			</table>
		</div>
		<div class="controls">
			<span class="controlbutton" @click="repeat"
				><repeaticon class="audiocontrol"></repeaticon
			></span>
			<span class="controlbutton" v-if="player.paused" @click="play"
				><playicon class="audiocontrol" style="padding: 8px"></playicon
			></span>
			<span class="controlbutton" v-else @click="pause"
				><pauseicon class="audiocontrol" style="padding: 8px"></pauseicon
			></span>
			<span class="controlbutton" @click="shuffle"
				><shuffleicon class="audiocontrol"></shuffleicon
			></span>
		</div>
	</div>
</template>

<script>
import progress from "@/handlers/progress.js";
import playicon from "@/assets/svg/Playicon.vue";
import repeaticon from "@/assets/svg/Repeaticon.vue";
import shuffleicon from "@/assets/svg/Shuffleicon.vue";
import pauseicon from "@/assets/svg/Pauseicon.vue";
import SeekBar from "@/components/utils/SeekBar.vue";

export default {
	name: "PlayerSection",
	props: {
		preTrack: {
			required: true,
		},
	},
	components: {
		playicon,
		repeaticon,
		shuffleicon,
		pauseicon,
		SeekBar,
	},
	data() {
		return {
			player: {
				paused: true,
				seekable: false,
			},
			barInterval: null,
			seekable: false,
		};
	},
	mounted() {},
	methods: {
		visibilityUpdate(event) {
			if (!this.$store.state.current.data) return;
			const emitData = {
				user_id: this.$store.state.user,
				server_id: this.$store.state.guild.id,
			};
			this.$socket.emit("playerPosReq", emitData);
		},
		doSeek(val) {
			if (!this.$store.state.current.data) return;
			const pos = (this.$store.state.current.audio.duration * val) / 100;

			this.$store.state.current.audio.currentTime = pos;
		},
		repeat() {
			if (!this.$store.state.current.data) return;
			const emitData = {
				controls: {
					toggle: "repeat",
				},
				user_id: this.$store.state.user,
				server_id: this.$store.state.guild.id,
			};
			this.$socket.emit("playerControl", emitData);
			console.log("Emitting:", "playerControl", emitData);
		},
		play() {
			if (!this.$store.state.current.data) {
				const emitData = {
					song: "walls could talk",
					user_id: this.$store.state.user,
					server_id: this.$store.state.guild.id,
				};
				this.$socket.emit("songReq", emitData);
				console.log("Emitting:", "songReq", emitData);
			} else if (this.$store.state.current.data && this.player.paused) {
				const emitData = {
					pause: false,
					user_id: this.$store.state.user,
					server_id: this.$store.state.guild.id,
				};
				this.$socket.emit("pauseReq", emitData);
				console.log("Emitting:", "pauseReq", emitData);
			}
		},
		pause() {
			if (!this.$store.state.current.data) return;
			const emitData = {
				pause: true,
				user_id: this.$store.state.user,
				server_id: this.$store.state.guild.id,
			};
			this.$socket.emit("pauseReq", emitData);
			console.log("Emitting:", "pauseReq", emitData);
		},
		shuffle() {
			if (!this.$store.state.current.data) return;
			const emitData = {
				controls: {
					toggle: "shuffle",
				},
				user_id: this.$store.state.user,
				server_id: this.$store.state.guild.id,
			};
			this.$socket.emit("playerControl", emitData);
			console.log("Emitting:", "playerControl", emitData);
		},
		continueProgressBar() {
			const comp = this;
			this.barInterval = setInterval(function () {
				if (comp.player.paused) {
					clearInterval(comp.barInterval);
					this.seekable = false;
				} else if (comp.progress >= 100) {
					comp.progress = 100;
					clearInterval(comp.barInterval);
					this.seekable = false;
				} else {
					if (comp.progress >= 100) {
						if (!this.$store.state.current.data) return;
						const emitData = {
							user_id: this.$store.state.user,
							server_id: this.$store.state.guild.id,
						};
						this.$socket.emit("playerPosReq", emitData);
					} else {
						comp.progress += 0.01;
					}
					this.seekable = true;
				}
			}, this.$store.state.current.data.duration / 10000);
		},
	},
	sockets: {
		newSeek(data) {
			if (!this.$store.state.current.data) return;
			this.$store.commit(
				"progInc",
				(data.seek * 100) / this.$store.state.current.data.duration
			);
			this.seekable = true;
		},
		newPause(data) {
			console.log("Incoming:", "newPause", data);
			if (data.pause && !this.player.paused) {
				if (this.barInterval) {
					this.player.paused = true;
					clearInterval(this.barInterval);
					this.seekable = false;
				}
			} else if (!data.pause && this.player.paused) {
				this.player.paused = false;
				this.seekable = true;
				this.continueProgressBar();
			}
		},
		newTrack(data) {
			console.log("Incoming:", "newTrack", data);
			this.$store.state.current.data = data.track;
			this.progress = 0;
			this.player.paused = false;
			this.seekable = true;
			this.continueProgressBar();
		},
		newTrackEnd(data) {
			console.log("Incoming:", "newTrackEnd", data);
			clearInterval(this.barInterval);
			this.progress = 100;
			this.player.paused = true;
			this.seekable = false;
			this.$store.state.current.data = null;
		},
		newVoiceState(data) {
			console.log("Incoming:", "newVoiceState", data);
			if (data.guild) {
				this.$store.state.guild = data.guild;
			} else {
				this.$store.state.guild = null;
			}
			if (data.vc) {
				this.$store.state.vc = data.vc;
			} else {
				this.$store.state.vc = null;
			}
		},
	},
	watch: {
		preTrack(after, before) {
			this.$store.state.current.data = this.preTrack;
			this.player = this.$store.state.player;
			if (this.preTrack) {
				if (this.preTrack.duration) {
					if (this.preTrack.duration != this.preTrack.position) {
						this.progress =
							(this.preTrack.position * 100) / this.preTrack.duration;
						if (!this.$store.state.player.paused) {
							this.continueProgressBar();
							this.seekable = true;
						}
					}
				}
			}
		},
	},
};
</script>

<style>
.currentsongname {
	position: relative;
	padding-left: 10px;
}
.currentsongchannel {
	position: relative;
	padding-left: 10px;
	bottom: 20px;
	color: #ffffff54;
}

.songdata {
	position: absolute;
	bottom: 10px;
	left: 0;
}

.currentthumbnail {
	height: 70px;
	margin-left: 30px;
	margin-top: 5px;
}

.playersection {
	background-color: var(--player-section);
	position: absolute;
	display: flex;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 100px;
}

.controls {
	margin: auto;
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-template-rows: repeat(1, 40px);
}

.audiocontrol {
	padding: 10px;
}

.controlbutton {
	border-radius: 50px;
}

.controlbutton:hover {
	background: #111;
	cursor: pointer;
}
</style>
