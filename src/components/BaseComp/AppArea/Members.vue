<template>
	<div class="membersdiv" id="membersdiv">
		<table>
			<tr
				class="member"
				v-for="member in $store.state.members"
				:key="member.id"
			>
				<td>
					<img :src="member.pfp" alt="memberpfp" class="memberpfp" srcset="" />
				</td>
				<td style="padding-bottom: 5px">
					<span class="membername">{{ member.name }}</span>
					<span class="memberdiscrim">#{{ member.discrim }}</span>
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
export default {};
</script>

<style>
.membersdiv {
	position: absolute;
	bottom: 0;
	right: 0;
	margin-bottom: 20px;
	margin-right: 20px;
	background: var(--sections);
	padding: 20px;
	opacity: 0;
	border-radius: 10px;
}

.memberpfp {
	height: 20px;
	border-radius: 50px;
}
.memberdiscrim {
	color: #ffffffc4;
}
.membername {
	padding-left: 5px;
	color: white;
}
</style>
