/**
 * Test fixtures index
 * Centralized exports for all test fixtures
 */

// WebSocket events
export {
	consoleOutputEvents,
	statusEvents,
	statsEvents,
	daemonMessageEvents,
	installationEvents,
	authEvents,
	edgeCaseEvents,
	allEvents,
	serverStartupSequence,
	serverShutdownSequence,
	serverCrashSequence,
	tokenRefreshSequence,
	createStatsEvent,
	createConsoleEvent,
	createStatusEvent,
} from './websocketEvents';

// WebSocket commands and responses
export {
	authCommands,
	powerCommands,
	consoleCommands,
	requestCommands,
	tokenResponses,
	apiResponses,
	commandResponsePairs,
	connectionStates,
	closeCodes,
	mockCredentials,
	mockNodeParameters,
	expectedOutputs,
	errorScenarios,
	createMockTokenResponse,
	createMockCommand,
	decodeJwtPayload,
} from './websocketCommands';
