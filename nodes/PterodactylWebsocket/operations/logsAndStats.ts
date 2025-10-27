import { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { PterodactylWebSocketManager, WebSocketTokenResponse } from '../../../shared/websocket';
import { pterodactylApiRequest } from '../../../shared/transport';

/**
 * Logs & Stats Operations Properties
 */
export const logsAndStatsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['logsAndStats'],
			},
		},
		options: [
			{
				name: 'Request Logs',
				value: 'requestLogs',
				description: 'Get server console logs',
				action: 'Request console logs',
			},
			{
				name: 'Request Stats',
				value: 'requestStats',
				description: 'Get server resource statistics',
				action: 'Request resource stats',
			},
		],
		default: 'requestLogs',
	},
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getClientServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['logsAndStats'],
			},
		},
		default: '',
		description: 'The server to get logs and stats from',
	},
	{
		displayName: 'Line Limit',
		name: 'lineLimit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['logsAndStats'],
				operation: ['requestLogs'],
			},
		},
		default: 100,
		description: 'Maximum number of log lines to return',
	},
	{
		displayName: 'Timeout (ms)',
		name: 'timeout',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['logsAndStats'],
			},
		},
		default: 5000,
		description: 'Maximum time to wait for response',
	},
];

/**
 * Execute Request Logs operation
 */
export async function executeRequestLogs(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const lineLimit = this.getNodeParameter('lineLimit', index, 100) as number;
	const timeout = this.getNodeParameter('timeout', index, 5000) as number;

	const credentials = await this.getCredentials('pterodactylClientApi', index);
	const panelUrl = credentials.panelUrl as string;
	const apiKey = credentials.apiKey as string;

	// Fetch WebSocket token
	const fetchToken = async (): Promise<WebSocketTokenResponse> => {
		const response = await pterodactylApiRequest.call(
			this,
			'GET',
			'/api/client',
			`/servers/${serverId}/websocket`,
			{},
			{},
			{},
			index,
		);
		return {
			token: response.data.token,
			socket: response.data.socket,
		};
	};

	const wsManager = new PterodactylWebSocketManager(
		{
			serverId,
			apiKey,
			panelUrl,
			autoReconnect: false,
		},
		fetchToken,
	);

	try {
		// Connect
		await wsManager.connect();

		// Collect log lines
		const logs = await new Promise<string[]>((resolve) => {
			const logLines: string[] = [];
			const timeoutHandle = setTimeout(() => {
				resolve(logLines);
			}, timeout);

			// Register handler BEFORE sending command
			wsManager.on('console output', (data: any) => {
				if (data && data[0]) {
					logLines.push(data[0]);
					if (logLines.length >= lineLimit) {
						clearTimeout(timeoutHandle);
						resolve(logLines);
					}
				}
			});

			// Request logs AFTER handler is registered
			wsManager.sendCommand({
				event: 'send logs',
				args: [],
			});
		});

		return [
			{
				json: {
					success: true,
					serverId,
					logs,
					lineCount: logs.length,
					timestamp: new Date().toISOString(),
				},
			},
		];
	} finally {
		wsManager.close();
	}
}

/**
 * Execute Request Stats operation
 */
export async function executeRequestStats(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const timeout = this.getNodeParameter('timeout', index, 5000) as number;

	const credentials = await this.getCredentials('pterodactylClientApi', index);
	const panelUrl = credentials.panelUrl as string;
	const apiKey = credentials.apiKey as string;

	// Fetch WebSocket token
	const fetchToken = async (): Promise<WebSocketTokenResponse> => {
		const response = await pterodactylApiRequest.call(
			this,
			'GET',
			'/api/client',
			`/servers/${serverId}/websocket`,
			{},
			{},
			{},
			index,
		);
		return {
			token: response.data.token,
			socket: response.data.socket,
		};
	};

	const wsManager = new PterodactylWebSocketManager(
		{
			serverId,
			apiKey,
			panelUrl,
			autoReconnect: false,
		},
		fetchToken,
	);

	try {
		// Connect
		await wsManager.connect();

		// Wait for stats response
		const stats = await new Promise<any>((resolve, reject) => {
			const timeoutHandle = setTimeout(() => {
				reject(new Error('Timeout waiting for stats'));
			}, timeout);

			// Register handler BEFORE sending command
			wsManager.on('stats', (data: any) => {
				clearTimeout(timeoutHandle);
				// Wings sends stats as a JSON string, need to parse it
				const statsData = typeof data[0] === 'string' ? JSON.parse(data[0]) : data[0];
				resolve(statsData);
			});

			// Request stats AFTER handler is registered
			wsManager.sendCommand({
				event: 'send stats',
				args: [],
			});
		});

		return [
			{
				json: {
					success: true,
					serverId,
					stats: {
						memory: {
							bytes: stats.memory_bytes,
							limit: stats.memory_limit_bytes,
							percentage: (stats.memory_bytes / stats.memory_limit_bytes) * 100,
						},
						cpu: {
							absolute: stats.cpu_absolute,
						},
						disk: {
							bytes: stats.disk_bytes,
						},
						network: {
							rxBytes: stats.network?.rx_bytes || 0,
							txBytes: stats.network?.tx_bytes || 0,
						},
						state: stats.state,
					},
					timestamp: new Date().toISOString(),
				},
			},
		];
	} finally {
		wsManager.close();
	}
}
