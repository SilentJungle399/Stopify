import NProgress from "nprogress";

NProgress.configure({
	template: `
	<div id="progressbar" class="progressing">
		<div class="bar" role="bar">
			<div class="peg"></div>
		</div>
	</div>
	`,
});

const background = "#151516";

export default {
	start(state) {
		NProgress.start();
		if (!state) {
			document.getElementById("progressbar").style.background = background;
		} else if (state === "load") {
			document.getElementById("progressbar").style.background = "transparent";
		} else if (state === "page") {
			document.getElementById("progressbar").style.background = background;
		}
	},
	done() {
		NProgress.done();
	},
};
