<template>
	<div class="ServerInfo">
		<table class="serverinfotable">
			<tr>
				<td rowspan="2">
					<img :src="$store.state.user.pfp" class="userpfp" alt="" />
				</td>
				<td>
					<span class="username">{{ $store.state.user.name }}</span>
				</td>
			</tr>
			<tr>
				<td>
					<span class="discrim">#{{ $store.state.user.discrim }}</span>
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
import progress from "@/handlers/progress.js";

export default {
	name: "SearchComp",
};
</script>

<style>
.ServerInfo {
	background-color: #0f0f0f;
	position: absolute;
	display: flex;
	top: 0;
	left: 0;
	width: 375px;
	height: 130px;
	border-radius: 0 0 50px 0;
}

.userpfp {
	height: 75px;
	border-radius: 50%;
}

.discrim {
	padding-left: 20px;
	position: relative;
	color: #ffffffc4;
	bottom: 20px;
}

.username {
	padding-left: 20px;
	font-size: 20px;
	position: relative;
	bottom: 5px;
}

.serverinfotable {
	margin: auto;
}
</style>
