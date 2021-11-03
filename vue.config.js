module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			customFileProtocol: "./",
			protocols: [
				{
					name: "stopify",
					schemes: ["stopify"],
				},
			],
		},
	},
	productionSourceMap: false,
};
