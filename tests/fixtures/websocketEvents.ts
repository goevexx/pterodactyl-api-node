/**
 * Test fixtures for Pterodactyl WebSocket events
 * Based on Pterodactyl Panel WebSocket API specification
 */

import { WebSocketEvent } from '../../shared/websocket';

/**
 * Console output events
 */
export const consoleOutputEvents: WebSocketEvent[] = [
	{
		event: 'console output',
		args: ['[INFO] Server started successfully'],
	},
	{
		event: 'console output',
		args: ['[WARN] Low memory warning'],
	},
	{
		event: 'console output',
		args: ['[ERROR] Failed to connect to database'],
	},
	{
		event: 'console output',
		args: [''], // Empty console line
	},
];

/**
 * Status change events
 */
export const statusEvents: WebSocketEvent[] = [
	{
		event: 'status',
		args: ['starting'],
	},
	{
		event: 'status',
		args: ['running'],
	},
	{
		event: 'status',
		args: ['stopping'],
	},
	{
		event: 'status',
		args: ['offline'],
	},
];

/**
 * Resource statistics events
 */
export const statsEvents: WebSocketEvent[] = [
	{
		event: 'stats',
		args: [
			{
				memory_bytes: 536870912, // 512 MB
				memory_limit_bytes: 1073741824, // 1 GB
				cpu_absolute: 45.5,
				disk_bytes: 2147483648, // 2 GB
				network: {
					rx_bytes: 1048576, // 1 MB received
					tx_bytes: 524288, // 512 KB transmitted
				},
				state: 'running',
			},
		],
	},
	{
		event: 'stats',
		args: [
			{
				memory_bytes: 1073741824, // 1 GB (at limit)
				memory_limit_bytes: 1073741824,
				cpu_absolute: 95.0, // High CPU
				disk_bytes: 5368709120, // 5 GB
				network: {
					rx_bytes: 10485760, // 10 MB received
					tx_bytes: 5242880, // 5 MB transmitted
				},
				state: 'running',
			},
		],
	},
	{
		event: 'stats',
		args: [
			{
				memory_bytes: 0,
				memory_limit_bytes: 1073741824,
				cpu_absolute: 0,
				disk_bytes: 0,
				state: 'offline',
			},
		],
	},
];

/**
 * Daemon message events
 */
export const daemonMessageEvents: WebSocketEvent[] = [
	{
		event: 'daemon message',
		args: ['Server container started'],
	},
	{
		event: 'daemon message',
		args: ['Backup completed successfully'],
	},
	{
		event: 'daemon message',
		args: ['Configuration updated'],
	},
];

/**
 * Installation events
 */
export const installationEvents: WebSocketEvent[] = [
	{
		event: 'install started',
		args: [],
	},
	{
		event: 'install output',
		args: ['Downloading server files...'],
	},
	{
		event: 'install output',
		args: ['Installing dependencies...'],
	},
	{
		event: 'install output',
		args: ['Configuring server...'],
	},
	{
		event: 'install completed',
		args: [],
	},
];

/**
 * JWT and authentication events
 */
export const authEvents: WebSocketEvent[] = [
	{
		event: 'jwt error',
		args: ['Invalid token signature'],
	},
	{
		event: 'token expiring',
		args: [],
	},
	{
		event: 'token expired',
		args: [],
	},
];

/**
 * Edge case events
 */
export const edgeCaseEvents: WebSocketEvent[] = [
	{
		event: 'console output',
		args: [''], // Empty string
	},
	{
		event: 'stats',
		args: [
			{
				memory_bytes: null, // Null value
				memory_limit_bytes: 1073741824,
				cpu_absolute: null,
				disk_bytes: null,
				state: 'unknown',
			},
		],
	},
	{
		event: 'stats',
		args: [
			{
				memory_bytes: 1073741824,
				memory_limit_bytes: 1073741824,
				cpu_absolute: 50,
				disk_bytes: 2147483648,
				// Missing network object
				state: 'running',
			},
		],
	},
	{
		event: 'unknown event', // Event type not in spec
		args: ['some data'],
	},
];

/**
 * Get all events for comprehensive testing
 */
export const allEvents: WebSocketEvent[] = [
	...consoleOutputEvents,
	...statusEvents,
	...statsEvents,
	...daemonMessageEvents,
	...installationEvents,
	...authEvents,
];

/**
 * Event sequences for testing workflows
 */
export const serverStartupSequence: WebSocketEvent[] = [
	{ event: 'status', args: ['starting'] },
	{ event: 'console output', args: ['[INFO] Loading configuration...'] },
	{ event: 'console output', args: ['[INFO] Starting services...'] },
	{ event: 'status', args: ['running'] },
	{
		event: 'stats',
		args: [
			{
				memory_bytes: 268435456, // 256 MB
				memory_limit_bytes: 1073741824,
				cpu_absolute: 10.5,
				disk_bytes: 1073741824,
				network: { rx_bytes: 0, tx_bytes: 0 },
				state: 'running',
			},
		],
	},
];

export const serverShutdownSequence: WebSocketEvent[] = [
	{ event: 'status', args: ['stopping'] },
	{ event: 'console output', args: ['[INFO] Shutting down services...'] },
	{ event: 'console output', args: ['[INFO] Cleanup completed'] },
	{ event: 'status', args: ['offline'] },
];

export const serverCrashSequence: WebSocketEvent[] = [
	{ event: 'console output', args: ['[ERROR] Fatal error occurred'] },
	{ event: 'console output', args: ['[ERROR] Stack trace...'] },
	{ event: 'status', args: ['offline'] },
];

export const tokenRefreshSequence: WebSocketEvent[] = [
	{ event: 'token expiring', args: [] },
	// After refresh, normal events continue
	{ event: 'status', args: ['running'] },
];

/**
 * Helper to create a mock stats event with custom values
 */
export function createStatsEvent(overrides?: Partial<any>): WebSocketEvent {
	return {
		event: 'stats',
		args: [
			{
				memory_bytes: 536870912,
				memory_limit_bytes: 1073741824,
				cpu_absolute: 50.0,
				disk_bytes: 2147483648,
				network: { rx_bytes: 1048576, tx_bytes: 524288 },
				state: 'running',
				...overrides,
			},
		],
	};
}

/**
 * Helper to create console output events
 */
export function createConsoleEvent(message: string): WebSocketEvent {
	return {
		event: 'console output',
		args: [message],
	};
}

/**
 * Helper to create status change events
 */
export function createStatusEvent(status: string): WebSocketEvent {
	return {
		event: 'status',
		args: [status],
	};
}
