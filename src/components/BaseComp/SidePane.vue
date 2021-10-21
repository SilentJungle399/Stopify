<template>
	<div class="serverinfo"></div>
</template>

<script>
import progress from "@/handlers/progress.js";

export default {
	name: "ServerInfo",
};
</script>

<style>
.serverinfo {
	background-color: #0f0f0f;
	position: absolute;
	top: 155px;
	left: 0;
	width: 375px;
	height: calc(100% - 235px);
	border-radius: 0 50px 0 0;
}
</style>
