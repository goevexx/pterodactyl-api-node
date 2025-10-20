/**
 * Test fixtures for Pterodactyl WebSocket commands and responses
 * Based on Pterodactyl Panel WebSocket API specification
 */

import { WebSocketCommand, WebSocketTokenResponse } from '../../shared/websocket';

/**
 * Authentication commands
 */
export const authCommands = {
	validAuth: {
		event: 'auth',
		args: ['valid.jwt.token.here'],
	} as WebSocketCommand,
	invalidAuth: {
		event: 'auth',
		args: ['invalid.token'],
	} as WebSocketCommand,
};

/**
 * Power state commands
 */
export const powerCommands = {
	start: {
		event: 'set state',
		args: ['start'],
	} as WebSocketCommand,
	stop: {
		event: 'set state',
		args: ['stop'],
	} as WebSocketCommand,
	restart: {
		event: 'set state',
		args: ['restart'],
	} as WebSocketCommand,
	kill: {
		event: 'set state',
		args: ['kill'],
	} as WebSocketCommand,
};

/**
 * Console commands
 */
export const consoleCommands = {
	simpleCommand: {
		event: 'send command',
		args: ['help'],
	} as WebSocketCommand,
	sayCommand: {
		event: 'send command',
		args: ['say Hello World'],
	} as WebSocketCommand,
	multiWordCommand: {
		event: 'send command',
		args: ['gamemode creative @a'],
	} as WebSocketCommand,
	emptyCommand: {
		event: 'send command',
		args: [''],
	} as WebSocketCommand,
};

/**
 * Logs and stats request commands
 */
export const requestCommands = {
	requestLogs: {
		event: 'send logs',
		args: [],
	} as WebSocketCommand,
	requestStats: {
		event: 'send stats',
		args: [],
	} as WebSocketCommand,
};

/**
 * Mock WebSocket token responses
 */
export const tokenResponses: Record<string, WebSocketTokenResponse> = {
	valid: {
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzMwMDAwMDAwfQ.signature',
		socket: 'wss://pterodactyl.example.com:8080',
	},
	expiringSoon: {
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.signature',
		socket: 'wss://pterodactyl.example.com:8080',
	},
	expired: {
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNTAwMDAwMDAwfQ.signature',
		socket: 'wss://pterodactyl.example.com:8080',
	},
	invalidFormat: {
		token: 'not.a.valid.jwt',
		socket: 'wss://pterodactyl.example.com:8080',
	},
	missingExpiry: {
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
		socket: 'wss://pterodactyl.example.com:8080',
	},
};

/**
 * Mock API responses for token fetching
 */
export const apiResponses = {
	validToken: {
		data: {
			token: tokenResponses.valid.token,
			socket: tokenResponses.valid.socket,
		},
	},
	errorResponse: {
		error: 'Unauthorized',
		message: 'Invalid API key',
	},
	networkError: {
		error: 'NetworkError',
		message: 'Failed to connect to server',
	},
};

/**
 * Expected command-response pairs for testing
 */
export const commandResponsePairs = [
	{
		command: powerCommands.start,
		expectedResponse: {
			event: 'status',
			args: ['starting'],
		},
	},
	{
		command: powerCommands.stop,
		expectedResponse: {
			event: 'status',
			args: ['stopping'],
		},
	},
	{
		command: requestCommands.requestLogs,
		expectedResponses: [
			{ event: 'console output', args: ['[INFO] Log line 1'] },
			{ event: 'console output', args: ['[INFO] Log line 2'] },
			{ event: 'console output', args: ['[INFO] Log line 3'] },
		],
	},
	{
		command: requestCommands.requestStats,
		expectedResponse: {
			event: 'stats',
			args: [
				{
					memory_bytes: 536870912,
					memory_limit_bytes: 1073741824,
					cpu_absolute: 45.5,
					disk_bytes: 2147483648,
					network: { rx_bytes: 1048576, tx_bytes: 524288 },
					state: 'running',
				},
			],
		},
	},
];

/**
 * WebSocket connection states for testing
 */
export const connectionStates = {
	connecting: 0, // WebSocket.CONNECTING
	open: 1, // WebSocket.OPEN
	closing: 2, // WebSocket.CLOSING
	closed: 3, // WebSocket.CLOSED
};

/**
 * Mock WebSocket close codes
 */
export const closeCodes = {
	normal: 1000, // Normal closure
	goingAway: 1001, // Going away
	protocolError: 1002, // Protocol error
	unsupportedData: 1003, // Unsupported data
	noStatus: 1005, // No status received
	abnormal: 1006, // Abnormal closure
	invalidData: 1007, // Invalid frame payload data
	policyViolation: 1008, // Policy violation
	messageTooBig: 1009, // Message too big
	internalError: 1011, // Internal server error
};

/**
 * Mock credentials for testing
 */
export const mockCredentials = {
	valid: {
		panelUrl: 'https://pterodactyl.example.com',
		apiKey: 'ptlc_validApiKeyHere123456789',
	},
	invalid: {
		panelUrl: 'https://pterodactyl.example.com',
		apiKey: 'invalid_key',
	},
	malformed: {
		panelUrl: 'not-a-valid-url',
		apiKey: '',
	},
};

/**
 * Mock node parameters for testing
 */
export const mockNodeParameters = {
	trigger: {
		serverId: 'a1b2c3d4',
		events: ['*'],
		options: {
			includeRawData: false,
			throttleEnabled: true,
			throttleInterval: 100,
			throttleMaxBurst: 10,
			discardExcess: false,
			autoReconnect: true,
			maxReconnectAttempts: 5,
		},
	},
	triggerFiltered: {
		serverId: 'a1b2c3d4',
		events: ['console output', 'status', 'stats'],
		options: {
			includeRawData: true,
			throttleEnabled: false,
		},
	},
	commandSetState: {
		serverId: 'a1b2c3d4',
		resource: 'serverControl',
		operation: 'setState',
		powerAction: 'start',
	},
	commandSendCommand: {
		serverId: 'a1b2c3d4',
		resource: 'serverControl',
		operation: 'sendCommand',
		command: 'say Hello World',
		waitForResponse: true,
		responseTimeout: 5000,
	},
	commandRequestLogs: {
		serverId: 'a1b2c3d4',
		resource: 'logsAndStats',
		operation: 'requestLogs',
		lineLimit: 100,
		timeout: 5000,
	},
	commandRequestStats: {
		serverId: 'a1b2c3d4',
		resource: 'logsAndStats',
		operation: 'requestStats',
		timeout: 5000,
	},
	connectionTest: {
		serverId: 'a1b2c3d4',
		resource: 'connection',
		operation: 'testConnection',
		timeout: 5000,
	},
};

/**
 * Expected output data structures for testing
 */
export const expectedOutputs = {
	triggerEvent: {
		json: {
			event: 'status',
			timestamp: expect.any(String),
			serverId: 'a1b2c3d4',
			data: ['running'],
		},
	},
	triggerEventWithRaw: {
		json: {
			event: 'status',
			timestamp: expect.any(String),
			serverId: 'a1b2c3d4',
			data: ['running'],
			raw: {
				event: 'status',
				args: ['running'],
			},
		},
	},
	setState: {
		json: {
			success: true,
			serverId: 'a1b2c3d4',
			action: 'start',
			status: 'starting',
			timestamp: expect.any(String),
		},
	},
	sendCommand: {
		json: {
			success: true,
			serverId: 'a1b2c3d4',
			command: 'say Hello World',
			consoleOutput: expect.any(Array),
			timestamp: expect.any(String),
		},
	},
	requestLogs: {
		json: {
			success: true,
			serverId: 'a1b2c3d4',
			logs: expect.any(Array),
			lineCount: expect.any(Number),
			timestamp: expect.any(String),
		},
	},
	requestStats: {
		json: {
			success: true,
			serverId: 'a1b2c3d4',
			stats: {
				memory: {
					bytes: expect.any(Number),
					limit: expect.any(Number),
					percentage: expect.any(Number),
				},
				cpu: {
					absolute: expect.any(Number),
				},
				disk: {
					bytes: expect.any(Number),
				},
				network: {
					rxBytes: expect.any(Number),
					txBytes: expect.any(Number),
				},
				state: expect.any(String),
			},
			timestamp: expect.any(String),
		},
	},
	testConnection: {
		json: {
			success: true,
			serverId: 'a1b2c3d4',
			connected: true,
			socketUrl: expect.any(String),
			timestamp: expect.any(String),
		},
	},
};

/**
 * Error scenarios for testing
 */
export const errorScenarios = {
	connectionTimeout: {
		error: 'WebSocket connection timeout',
		code: 'TIMEOUT',
	},
	authenticationFailed: {
		error: 'Authentication failed',
		code: 'AUTH_ERROR',
	},
	invalidServerId: {
		error: 'Server not found',
		code: 'NOT_FOUND',
	},
	rateLimited: {
		error: 'Rate limit exceeded',
		code: 'RATE_LIMIT',
	},
	tokenFetchFailed: {
		error: 'Failed to fetch WebSocket token',
		code: 'TOKEN_FETCH_ERROR',
	},
	maxReconnectAttemptsReached: {
		error: 'Max reconnection attempts reached',
		attempts: 5,
	},
};

/**
 * Helper to create a mock WebSocket token response
 */
export function createMockTokenResponse(overrides?: Partial<WebSocketTokenResponse>): WebSocketTokenResponse {
	return {
		token: tokenResponses.valid.token,
		socket: tokenResponses.valid.socket,
		...overrides,
	};
}

/**
 * Helper to create a mock command
 */
export function createMockCommand(event: string, args: any[] = []): WebSocketCommand {
	return { event, args };
}

/**
 * Helper to decode JWT payload (for testing token refresh logic)
 */
export function decodeJwtPayload(token: string): any {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		return JSON.parse(Buffer.from(parts[1], 'base64').toString());
	} catch {
		return null;
	}
}
