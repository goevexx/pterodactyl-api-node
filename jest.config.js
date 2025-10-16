module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/*.test.ts'],
	collectCoverageFrom: [
		'credentials/**/*.ts',
		'nodes/**/*.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/dist/**',
		// Exclude operations without tests (to be added in future PRs)
		'!nodes/Pterodactyl/actions/account/**',
		'!nodes/Pterodactyl/actions/backup/**',
		'!nodes/Pterodactyl/actions/database/**',
		'!nodes/Pterodactyl/actions/file/**',
	],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
};
