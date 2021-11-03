<template>
	<input
		placeholder="Search for songs..."
		type="text"
		class="searchinput"
		v-model="searchinput"
		@keypress.enter="initSearch"
	/>
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
			if (this.$store.state.joinedParty) {
				return this.$parent.$emit(
					"makealert",
					"You do not have permission to add songs in this party!"
				);
			}
			const emitData = {
				song: this.searchinput,
			};
			ipcRenderer.send("songSearchReq", emitData);
			this.$parent.$emit("makealert", `Loading results for: ${emitData.song}`);
			console.log("Emitting:", "songSearchReq", emitData);
		},
	},
};
</script>

<style>
/* .searchcomp {
	background-color: var(--sections);
	position: absolute;
	top: 0;
	display: flex;
	right: 0;
	width: calc(100% - 375px - 25px);
	height: 100px;
	border-radius: 0 0 0 50px;
} */

.searchinput {
	/* margin: auto; */
	border: none;
	background: var(--sections);
	/* border-bottom: solid #1a5377 1.5px; */
	color: #ffffffc4;
	outline: none;
	position: relative;
	padding-left: 20px;
	border-radius: 100px;
	right: 0;
	left: 0px;
	height: 40px;
	margin: 20px 20px;
	width: calc(100% - 60px);
	font-size: 17px;
	transition: background 0.5s;
}
</style>
