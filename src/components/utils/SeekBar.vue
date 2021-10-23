<template>
	<div class="barcontainer">
		<div
			@click="seek"
			@mouseover="showPeg(true)"
			@mouseout="showPeg(false)"
			@mousedown="down"
			class="seekBar"
		>
			<div class="progress" :style="`width: ${$store.state.progress}%`"></div>
			<div
				id="peg"
				class="progresshandle"
				@mousedown="down"
				:style="`left: ${$store.state.progress}%; opacity: ${show ? 1 : 0}`"
			></div>
		</div>
	</div>
</template>

<script>
export default {
	name: "SeekBar",
	props: {
		draggable: {
			required: true,
		},
	},
	data() {
		return {
			show: false,
			dragging: false,
			lis: false,
		};
	},
	methods: {
		mousemove(event) {
			this.$store.commit("progInc", (event.clientX * 100) / window.innerWidth);
		},
		showPeg(ev) {
			if (!this.dragging) {
				this.show = ev;
			}
		},
		seek(event) {
			if (!this.draggable) return;
			const perc = (event.clientX * 100) / window.innerWidth;

			// this.$emit("progressUpdate", perc);
			this.$emit("seekAttempt", perc);
		},
		removelistener(event) {
			if (!this.lis) return;
			window.removeEventListener("mousemove", this.mousemove);
			this.lis = false;
			const perc = (event.clientX * 100) / window.innerWidth;
			this.$emit("seekAttempt", perc);
			this.dragging = false;
		},
		down(event) {
			if (this.draggable) {
				window.addEventListener("mousemove", this.mousemove);
				this.lis = true;
				window.addEventListener("mouseup", this.removelistener);
				this.dragging = true;
			}
		},
	},
};
</script>

<style>
.seekBar {
	background: #0f1d3c;
	user-select: none;

	position: fixed;
	z-index: 1;
	bottom: 100px;
	left: 0;
	padding: 1px;

	width: 100%;
	height: 2px;
}

.seekBar:hover {
	cursor: pointer;
}

.progresshandle {
	user-select: none;
	display: block;
	position: absolute;
	z-index: 2;
	margin-top: -8px;
	margin-left: -10px;
	width: 10px;
	opacity: 0;
	transition: opacity 0.5s;
	height: 10px;
	border: 4px solid red;
	border-top-color: red;
	border-right-color: red;
	border-radius: 100%;
	background-color: red;
	box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
	cursor: pointer;
}

.progress {
	background: red;

	position: fixed;
	z-index: 1;
	bottom: 100px;
	left: 0;
	padding: 1px;

	height: 2px;
}
</style>
