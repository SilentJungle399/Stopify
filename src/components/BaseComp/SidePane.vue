<template>
	<div class="sidepane"></div>
</template>

<script>
import progress from "@/handlers/progress.js";

export default {
	name: "SidePane",
};
</script>

<style>
.sidepane {
	background-color: var(--sections);
	position: absolute;
	top: 125px;
	left: 0;
	width: 375px;
	height: calc(100% - 230px);
	border-radius: 0 50px 0 0;
}
</style>
