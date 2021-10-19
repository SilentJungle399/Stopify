<template>
	<div id="app">
		<TitleBar />
		<div class="container">
			<img alt="Vue logo" src="./assets/logo.png" />
		</div>
	</div>
</template>

<script>
import TitleBar from "./components/TitleBar.vue";

export default {
	name: "App",
	components: {
		TitleBar,
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.container {
	margin-top: 35px;
}
</style>
