module.exports = {
	moduleNameMapper: {
		"^N/ui/serverWidget$": "<rootDir>/__mocks__/serverWidget.js",
		"^N/ui/dialog$": "<rootDir>/__mocks__/dialog.js",
		"^N/(.*)$": "<rootDir>/__mocks__/$1.js",
	},
	modulePaths: [
		"<rootDir>/src",
		"<rootDir>/__mocks__",
	],
	collectCoverageFrom: [
		'src/**/*.js',
		// Exclude node_modules or specific helper files if necessary
		'!**/node_modules/**'
	],
	coverageProvider: "v8"
};