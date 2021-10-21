<template>
	<div class="searchcomp">
		<input
			placeholder="Search for songs..."
			type="text"
			class="searchinput"
			v-model="searchinput"
			@keypress.enter="initSearch"
		/>
	</div>
</template>

<script>
import progress from "@/handlers/progress.js";
import { ipcRenderer } from "electron";

export default {
	name: "SearchComp",
	data() {
		return {
			searchinput: null,
		};
	},
	methods: {
		initSearch() {
			const emitData = {
				song: this.searchinput,
			};
			ipcRenderer.send("songSearchReq", emitData);
			console.log("Emitting:", "songSearchReq", emitData);
		},
	},
};
</script>

<style>
.searchcomp {
	background-color: #0f0f0f;
	position: absolute;
	top: 0;
	display: flex;
	right: 0;
	width: calc(100% - 375px - 25px);
	height: 130px;
	border-radius: 0 0 0 50px;
}

.searchinput {
	margin: auto;
	border: none;
	background: #0f0f0f;
	border-bottom: solid #ffffff4f 1.5px;
	color: #ffffffc4;
	outline: none;
	width: 450px;
	padding-left: 5px;
	height: 40px;
	font-size: 20px;
	transition: background 0.5s;
}

.searchinput:focus {
	background: black;
}
</style>
