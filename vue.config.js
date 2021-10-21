module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			customFileProtocol: "stopify://./",
		},
	},
};
