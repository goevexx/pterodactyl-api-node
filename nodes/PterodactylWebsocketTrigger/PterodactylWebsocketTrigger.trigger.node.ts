import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
} from 'n8n-workflow';
import { PterodactylWebSocketManager, EventThrottler, WebSocketTokenResponse } from '../../shared/websocket';
import { pterodactylApiRequest } from '../../shared/transport';

export class PterodactylWebsocketTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pterodactyl WebSocket Trigger',
		name: 'pterodactylWebsocketTrigger',
		icon: 'file:pterodactylWebsocketTrigger.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers on Pterodactyl WebSocket events (server status, console output, stats)',
		defaults: {
			name: 'Pterodactyl WebSocket Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'pterodactylClientApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Server ID',
				name: 'serverId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the server to monitor',
				placeholder: 'e.g., a1b2c3d4',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'All Events',
						value: '*',
						description: 'Listen to all events',
					},
					{
						name: 'Console Output',
						value: 'console output',
						description: 'Server console logs',
					},
					{
						name: 'Status',
						value: 'status',
						description: 'Server status changes (starting, running, stopping, offline)',
					},
					{
						name: 'Stats',
						value: 'stats',
						description: 'Resource usage statistics (CPU, memory, disk, network)',
					},
					{
						name: 'Daemon Message',
						value: 'daemon message',
						description: 'Messages from Wings daemon',
					},
					{
						name: 'Install Started',
						value: 'install started',
						description: 'Server installation started',
					},
					{
						name: 'Install Output',
						value: 'install output',
						description: 'Installation progress output',
					},
					{
						name: 'Install Completed',
						value: 'install completed',
						description: 'Installation finished',
					},
					{
						name: 'JWT Error',
						value: 'jwt error',
						description: 'Authentication/token errors',
					},
					{
						name: 'Token Expiring',
						value: 'token expiring',
						description: 'Token about to expire',
					},
					{
						name: 'Token Expired',
						value: 'token expired',
						description: 'Token has expired',
					},
				],
				default: ['*'],
				description: 'Events to trigger the workflow on',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Raw Data',
						name: 'includeRawData',
						type: 'boolean',
						default: false,
						description: 'Whether to include the raw WebSocket message in the output',
					},
					{
						displayName: 'Enable Throttling',
						name: 'throttleEnabled',
						type: 'boolean',
						default: true,
						description: 'Whether to throttle high-frequency events to prevent overwhelming the workflow',
					},
					{
						displayName: 'Throttle Interval (ms)',
						name: 'throttleInterval',
						type: 'number',
						default: 100,
						displayOptions: {
							show: {
								throttleEnabled: [true],
							},
						},
						description: 'Minimum milliseconds between event emissions',
					},
					{
						displayName: 'Throttle Max Burst',
						name: 'throttleMaxBurst',
						type: 'number',
						default: 10,
						displayOptions: {
							show: {
								throttleEnabled: [true],
							},
						},
						description: 'Maximum events allowed in a burst',
					},
					{
						displayName: 'Discard Excess Events',
						name: 'discardExcess',
						type: 'boolean',
						default: false,
						displayOptions: {
							show: {
								throttleEnabled: [true],
							},
						},
						description: 'Whether to discard excess events instead of queuing them',
					},
					{
						displayName: 'Auto Reconnect',
						name: 'autoReconnect',
						type: 'boolean',
						default: true,
						description: 'Whether to automatically reconnect on connection loss',
					},
					{
						displayName: 'Max Reconnect Attempts',
						name: 'maxReconnectAttempts',
						type: 'number',
						default: 5,
						displayOptions: {
							show: {
								autoReconnect: [true],
							},
						},
						description: 'Maximum number of reconnection attempts',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const serverId = this.getNodeParameter('serverId') as string;
		const events = this.getNodeParameter('events') as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const includeRawData = options.includeRawData as boolean || false;
		const throttleEnabled = options.throttleEnabled !== false;
		const throttleInterval = options.throttleInterval as number || 100;
		const throttleMaxBurst = options.throttleMaxBurst as number || 10;
		const discardExcess = options.discardExcess as boolean || false;
		const autoReconnect = options.autoReconnect !== false;
		const maxReconnectAttempts = options.maxReconnectAttempts as number || 5;

		// Get credentials
		const credentials = await this.getCredentials('pterodactylClientApi');
		const panelUrl = credentials.panelUrl as string;
		const apiKey = credentials.apiKey as string;

		// Function to fetch WebSocket token
		const fetchToken = async (): Promise<WebSocketTokenResponse> => {
			const response = await pterodactylApiRequest.call(
				this as any, // Cast to any for trigger functions compatibility
				'GET',
				'/api/client',
				`/servers/${serverId}/websocket`,
				{},
				{},
				{},
				0,
			);
			return {
				token: response.data.token,
				socket: response.data.socket,
			};
		};

		// Initialize WebSocket manager
		const wsManager = new PterodactylWebSocketManager(
			{
				serverId,
				apiKey,
				panelUrl,
				autoReconnect,
				maxReconnectAttempts,
			},
			fetchToken,
		);

		// Initialize throttler if enabled
		let throttler: EventThrottler | null = null;
		if (throttleEnabled) {
			throttler = new EventThrottler({
				interval: throttleInterval,
				maxBurst: throttleMaxBurst,
				discardExcess,
			});
		}

		// Check if we should emit this event based on filter
		const shouldEmit = (eventName: string): boolean => {
			if (events.includes('*')) return true;
			return events.includes(eventName);
		};

		// Set up event handlers
		const handleEvent = (eventName: string) => {
			return (data: any) => {
				if (!shouldEmit(eventName)) return;

				const item = {
					json: {
						event: eventName,
						timestamp: new Date().toISOString(),
						serverId,
						data,
						...(includeRawData && { raw: { event: eventName, args: data } }),
					},
				};

				// Emit with or without throttling
				if (throttler) {
					throttler.add(
						{ event: eventName, args: data },
						() => this.emit([this.helpers.returnJsonArray([item])]),
					);
				} else {
					this.emit([this.helpers.returnJsonArray([item])]);
				}
			};
		};

		// Register handlers for all possible events
		const eventNames = [
			'console output',
			'status',
			'stats',
			'daemon message',
			'install started',
			'install output',
			'install completed',
			'jwt error',
			'token expiring',
			'token expired',
		];

		eventNames.forEach((eventName) => {
			wsManager.on(eventName, handleEvent(eventName));
		});

		// Handle special events
		wsManager.on('error', (error) => {
			console.error('[PterodactylWebsocketTrigger] Error:', error);
		});

		wsManager.on('disconnected', (data) => {
			console.log('[PterodactylWebsocketTrigger] Disconnected:', data);
		});

		wsManager.on('reconnected', (data) => {
			console.log('[PterodactylWebsocketTrigger] Reconnected:', data);
		});

		wsManager.on('reconnect_failed', (data) => {
			console.error('[PterodactylWebsocketTrigger] Reconnection failed:', data);
		});

		// Connect to WebSocket
		try {
			await wsManager.connect();
			console.log('[PterodactylWebsocketTrigger] Connected successfully');
		} catch (error) {
			console.error('[PterodactylWebsocketTrigger] Connection failed:', error);
			throw error;
		}

		// Manual trigger function for testing
		const manualTriggerFunction = async () => {
			// Emit sample data for manual testing
			const sampleItem = {
				json: {
					event: 'status',
					timestamp: new Date().toISOString(),
					serverId,
					data: ['running'],
					message: 'Manual trigger - sample event',
				},
			};
			this.emit([this.helpers.returnJsonArray([sampleItem])]);
		};

		// Return close function for cleanup
		const closeFunction = async () => {
			console.log('[PterodactylWebsocketTrigger] Closing connection');
			if (throttler) {
				throttler.clear();
			}
			wsManager.close();
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}
