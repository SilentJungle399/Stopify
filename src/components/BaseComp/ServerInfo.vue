<template>
	<div class="ServerInfo">
		<table v-if="this.$store.state.guild" class="serverinfotable">
			<tr>
				<td rowspan="2">
					<img :src="this.$store.state.guild.icon" class="guildicon" alt="" />
				</td>
				<td>
					<span class="guildname">{{ this.$store.state.guild.name }}</span>
				</td>
			</tr>
			<tr>
				<td>
					<span class="vcname">#{{ this.$store.state.vc.name }}</span>
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

.guildicon {
	height: 75px;
	border-radius: 50%;
}

.vcname {
	padding-left: 20px;
	position: relative;
	color: #ffffffc4;
	bottom: 20px;
}

.guildname {
	padding-left: 20px;
	font-size: 25px;
	position: relative;
	bottom: 5px;
}

.serverinfotable {
	margin: auto auto auto 70px;
}
</style>
