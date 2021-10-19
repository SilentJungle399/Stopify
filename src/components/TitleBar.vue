<template>
	<div class="titlebar">
		<button class="exit" @click="quit">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="26"
				viewBox="0 0 25 20"
				width="26"
			>
				<path
					d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					fill="white"
				/>
			</svg>
		</button>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
	name: "TitleBar",
	methods: {
		quit() {
			ipcRenderer.send("quit", {});
		},
	},
};
</script>

<style>
.titlebar {
	display: flex;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 35px;
	background: #222;
}

.exit {
	position: absolute;
	right: 0;
	height: 35px;
	font-size: 20px;
	text-align: center;
	background: #222;
	width: 50px;
	color: white;
	border: none;
}

.exit:hover {
	background: rgb(211, 18, 18);
	cursor: pointer;
}
</style>
