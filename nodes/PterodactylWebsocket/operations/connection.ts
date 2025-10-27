import { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { PterodactylWebSocketManager, WebSocketTokenResponse } from '../../../shared/websocket';
import { pterodactylApiRequest } from '../../../shared/transport';

/**
 * Connection Operations Properties
 */
export const connectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['connection'],
			},
		},
		options: [
			{
				name: 'Test Connection',
				value: 'testConnection',
				description: 'Test WebSocket connectivity',
				action: 'Test connection',
			},
			{
				name: 'Send Auth',
				value: 'sendAuth',
				description: 'Re-authenticate with new token',
				action: 'Send authentication',
			},
		],
		default: 'testConnection',
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
				resource: ['connection'],
			},
		},
		default: '',
		description: 'The server to test connection for',
	},
];

/**
 * Execute Test Connection operation
 */
export async function executeTestConnection(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const serverId = this.getNodeParameter('serverId', index) as string;

	const credentials = await this.getCredentials('pterodactylClientApi', index);
	const panelUrl = credentials.panelUrl as string;
	const apiKey = credentials.apiKey as string;

	const startTime = Date.now();

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

		const connectionTime = Date.now() - startTime;

		// Verify connection is healthy
		const isConnected = wsManager.isConnected();

		return [
			{
				json: {
					success: true,
					serverId,
					connected: isConnected,
					connectionTime,
					timestamp: new Date().toISOString(),
					message: 'WebSocket connection test successful',
				},
			},
		];
	} catch (error: any) {
		return [
			{
				json: {
					success: false,
					serverId,
					connected: false,
					error: error.message,
					timestamp: new Date().toISOString(),
					message: 'WebSocket connection test failed',
				},
			},
		];
	} finally {
		wsManager.close();
	}
}

/**
 * Execute Send Auth operation
 */
export async function executeSendAuth(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const serverId = this.getNodeParameter('serverId', index) as string;

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
		// Connect (this automatically sends auth)
		await wsManager.connect();

		// Fetch a new token and re-auth
		const newTokenData = await fetchToken();

		wsManager.sendCommand({
			event: 'auth',
			args: [newTokenData.token],
		});

		// Wait a moment for confirmation
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return [
			{
				json: {
					success: true,
					serverId,
					message: 'Re-authentication successful',
					timestamp: new Date().toISOString(),
				},
			},
		];
	} catch (error: any) {
		return [
			{
				json: {
					success: false,
					serverId,
					error: error.message,
					message: 'Re-authentication failed',
					timestamp: new Date().toISOString(),
				},
			},
		];
	} finally {
		wsManager.close();
	}
}
