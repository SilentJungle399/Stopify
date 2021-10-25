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
				><repeaticon></repeaticon
			></span>
			<span class="controlbutton" @click="ff(-10)">
				<backw class="audiocontrol"></backw>
			</span>
			<span class="controlbutton" @click="skip(false)">
				<SkipPrevious class="audiocontrol"></SkipPrevious>
			</span>
			<span
				class="controlbutton"
				v-if="$store.state.controls.paused"
				@click="playpause"
				><playicon class="audiocontrol"></playicon
			></span>
			<span class="controlbutton" v-else @click="playpause"
				><pauseicon class="audiocontrol"></pauseicon
			></span>
			<span class="controlbutton" @click="skip(true)">
				<SkipNext class="audiocontrol"></SkipNext>
			</span>
			<span class="controlbutton" @click="ff(10)">
				<forw class="audiocontrol"></forw>
			</span>

			<span class="controlbutton" @click="shuffle">
				<shuffleicon></shuffleicon>
			</span>
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
import SkipNext from "@/assets/svg/SkipNext.vue";
import SkipPrevious from "@/assets/svg/SkipPrevious.vue";
import forw from "@/assets/svg/forw.vue";
import backw from "@/assets/svg/backw.vue";
import { ipcRenderer } from "electron";

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
		SkipNext,
		SkipPrevious,
		forw,
		backw,
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
		doSeek(val) {
			if (!this.$store.state.current.data)
				return this.$emit("makealert", "Nothing is being played right now!");
			const pos = (this.$store.state.current.audio.duration * val) / 100;

			this.$store.state.current.audio.currentTime = pos > 0 ? pos : 0;
		},
		ff(val) {
			const pos = this.$store.state.current.audio.currentTime + val;
			this.$store.state.current.audio.currentTime = pos > 0 ? pos : 0;
		},
		skip(s) {
			if (s) {
				this.$store.state.controls.paused = true;
				this.$store.state.current.audio.pause();
				this.$store.state.current.audio = null;
				this.$store.commit("progInc", 0);

				if (this.$store.state.controls.repeat === 2) {
					this.$parent.$refs.mainarea.play(this.$store.state.current.data);
				} else if (this.$store.state.queue.length > 0) {
					if (this.$store.state.controls.repeat === 0) {
						this.$parent.$refs.mainarea.play(this.$store.state.queue.shift());
					} else {
						this.$parent.$refs.mainarea.play(this.$store.state.queue.shift());
						this.$store.state.queue.push(this.$store.state.current.data);
					}
					this.$store.state.current.data = null;
				}
			} else {
				this.$store.state.current.audio.currentTime = 0;
			}
		},
		repeat() {
			this.$store.state.controls.repeat =
				this.$store.state.controls.repeat === 0
					? 1
					: this.$store.state.controls.repeat === 1
					? 2
					: 0;
			this.$emit(
				"makealert",
				this.$store.state.controls.repeat === 1
					? "Enabled queue repeat!"
					: this.$store.state.controls.repeat === 2
					? "Repeating current song!"
					: "Disabled Repeat."
			);
		},
		playpause() {
			if (!this.$store.state.current.data) {
				this.$emit("makealert", "Nothing is being played right now!");
			} else if (this.$store.state.current.data) {
				if (this.$store.state.current.audio.paused) {
					this.$store.state.current.audio.play();
					this.$emit("makealert", "Resumed the song!");
					this.$store.state.controls.paused = false;
				} else {
					this.$store.state.current.audio.pause();
					this.$emit("makealert", "Paused the song!");
					this.$store.state.controls.paused = true;
				}
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
			this.$store.state.controls.shuffle =
				this.$store.state.controls.shuffle === 1 ? 0 : 1;
			this.$emit(
				"makealert",
				this.$store.state.controls.shuffle === 1
					? "Enabled shuffle!"
					: "Disabled shuffle."
			);
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
			if (data.pause && !this.$store.state.controls.paused) {
				if (this.barInterval) {
					this.$store.state.controls.paused = true;
					clearInterval(this.barInterval);
					this.seekable = false;
				}
			} else if (!data.pause && this.$store.state.controls.paused) {
				this.$store.state.controls.paused = false;
				this.seekable = true;
				this.continueProgressBar();
			}
		},
		newTrack(data) {
			console.log("Incoming:", "newTrack", data);
			this.$store.state.current.data = data.track;
			this.progress = 0;
			this.$store.state.controls.paused = false;
			this.seekable = true;
			this.continueProgressBar();
		},
		newTrackEnd(data) {
			console.log("Incoming:", "newTrackEnd", data);
			clearInterval(this.barInterval);
			this.progress = 100;
			this.$store.state.controls.paused = true;
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
						if (!this.$store.state.$store.state.controls.paused) {
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
	display: flex;
}

.audiocontrol {
	padding: 10px;
	fill: white;
	transition: all 0.5s;
}

.controlbutton {
	border-radius: 50px;
	transition: all 0.25s;
	font-size: 0;
}

.controlbutton:hover {
	background: #18162b;
	cursor: pointer;
}
</style>
