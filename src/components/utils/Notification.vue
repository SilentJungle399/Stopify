<template>
	<div id="notif" class="notification">
		<span class="message">{{ msg }}</span>
		<!-- <span class="message">asasasa</span> -->
	</div>
</template>

<script>
export default {
	name: "Notification",
	props: {
		msg: {
			required: true,
		},
	},
};
</script>

<style>
.notification {
	position: absolute;
	z-index: 1;
	min-width: 300px;
	max-width: 500px;
	right: 10px;
	padding: 10px;
	top: 10px;
	border-radius: 5px;
	border-style: solid;
	background-color: var(--body);
	border-left-color: #463890;
	border-left-width: 5px;
	border-top: none;
	overflow-wrap: break-word;
	opacity: 0;
	border-bottom: none;
	border-right: none;
	transition: opacity 0.5s;
}

.message {
	white-space: initial;
	position: initial;
	height: 0;
	margin-left: 0;
	line-height: 0;
	font-weight: normal;
	font-size: initial;
}
</style>
