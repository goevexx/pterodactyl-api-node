import { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { PterodactylWebSocketManager, WebSocketTokenResponse } from '../../../shared/websocket';
import { pterodactylApiRequest } from '../../../shared/transport';

/**
 * Server Control Operations Properties
 */
export const serverControlOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['serverControl'],
			},
		},
		options: [
			{
				name: 'Set State',
				value: 'setState',
				description: 'Change server power state',
				action: 'Set server state',
			},
			{
				name: 'Send Command',
				value: 'sendCommand',
				description: 'Execute console command',
				action: 'Send console command',
			},
		],
		default: 'setState',
	},
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['serverControl'],
			},
		},
		default: '',
		description: 'The ID of the server',
	},
	{
		displayName: 'Power Action',
		name: 'powerAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['serverControl'],
				operation: ['setState'],
			},
		},
		options: [
			{
				name: 'Start',
				value: 'start',
			},
			{
				name: 'Stop',
				value: 'stop',
			},
			{
				name: 'Restart',
				value: 'restart',
			},
			{
				name: 'Kill',
				value: 'kill',
			},
		],
		default: 'start',
		description: 'Power action to perform',
	},
	{
		displayName: 'Command',
		name: 'command',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['serverControl'],
				operation: ['sendCommand'],
			},
		},
		default: '',
		description: 'Console command to execute',
		placeholder: 'say Hello World',
	},
	{
		displayName: 'Wait for Response',
		name: 'waitForResponse',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['serverControl'],
				operation: ['sendCommand'],
			},
		},
		default: false,
		description: 'Whether to wait for console output response',
	},
	{
		displayName: 'Response Timeout (ms)',
		name: 'responseTimeout',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['serverControl'],
				operation: ['sendCommand'],
				waitForResponse: [true],
			},
		},
		default: 5000,
		description: 'Maximum time to wait for response',
	},
];

/**
 * Execute Set State operation
 */
export async function executeSetState(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const powerAction = this.getNodeParameter('powerAction', index) as string;

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

		// Send power command
		wsManager.sendCommand({
			event: 'set state',
			args: [powerAction],
		});

		// Wait for status confirmation
		const newStatus = await new Promise<string>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Timeout waiting for status confirmation'));
			}, 10000);

			wsManager.on('status', (data: any) => {
				clearTimeout(timeout);
				resolve(data[0]);
			});
		});

		return [
			{
				json: {
					success: true,
					serverId,
					action: powerAction,
					status: newStatus,
					timestamp: new Date().toISOString(),
				},
			},
		];
	} finally {
		wsManager.close();
	}
}

/**
 * Execute Send Command operation
 */
export async function executeSendCommand(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const command = this.getNodeParameter('command', index) as string;
	const waitForResponse = this.getNodeParameter('waitForResponse', index, false) as boolean;
	const responseTimeout = this.getNodeParameter('responseTimeout', index, 5000) as number;

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

		// Send command
		wsManager.sendCommand({
			event: 'send command',
			args: [command],
		});

		let consoleOutput: string[] = [];

		// Wait for response if requested
		if (waitForResponse) {
			consoleOutput = await new Promise<string[]>((resolve) => {
				const outputs: string[] = [];
				const timeout = setTimeout(() => {
					resolve(outputs); // Return what we have so far
				}, responseTimeout);

				wsManager.on('console output', (data: any) => {
					if (data && data[0]) {
						outputs.push(data[0]);
					}
				});

				// Give it a moment to receive output
				setTimeout(() => {
					clearTimeout(timeout);
					resolve(outputs);
				}, Math.min(responseTimeout, 2000));
			});
		}

		return [
			{
				json: {
					success: true,
					serverId,
					command,
					consoleOutput,
					timestamp: new Date().toISOString(),
				},
			},
		];
	} finally {
		wsManager.close();
	}
}
