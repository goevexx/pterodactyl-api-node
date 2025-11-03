import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IExecuteFunctions,
} from 'n8n-workflow';
import {
	PterodactylWebSocketManager,
	EventBatcher,
	WebSocketTokenResponse,
} from '../../shared/websocket';
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
				displayName: 'Server',
				name: 'serverId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getClientServers',
				},
				default: '',
				required: true,
				description: 'The server to monitor',
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
						description: 'System messages from Wings daemon',
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
					displayName: 'Enable Event Batching',
					name: 'throttleEnabled',
					type: 'boolean',
					default: true,
					description:
						'Whether to batch high-frequency events to reduce workflow executions and improve performance',
					},
					{
					displayName: 'Batch Interval (ms)',
					name: 'throttleInterval',
					type: 'number',
					default: 100,
					displayOptions: {
						show: {
							throttleEnabled: [true],
						},
					},
					description: 'How often to emit batched events (in milliseconds)',
					},
					{
					displayName: 'Events Per Batch',
					name: 'throttleMaxBurst',
					type: 'number',
					default: 10,
					displayOptions: {
						show: {
							throttleEnabled: [true],
						},
					},
					description: 'Maximum number of events to include in each batch',
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
					description: 'Whether to discard events exceeding batch size instead of queuing them for the next batch',
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

	methods = {
		loadOptions: {
			async getClientServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						'',
						{},
						{},
						{},
						0,
					);

					const servers = response.data || [];

					if (servers.length === 0) {
						return [
							{
								name: 'No servers found',
								value: '',
							},
						];
					}

					return servers.map((server: any) => ({
						name: `${server.attributes.name} (${server.attributes.identifier})`,
						value: server.attributes.identifier,
					}));
				} catch (error) {
					console.error('Error fetching servers:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},
		},
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const serverId = this.getNodeParameter('serverId') as string;
		const events = this.getNodeParameter('events') as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const includeRawData = (options.includeRawData as boolean) || false;
		const throttleEnabled = options.throttleEnabled !== false;
		const throttleInterval = (options.throttleInterval as number) || 100;
		const throttleMaxBurst = (options.throttleMaxBurst as number) || 10;
		const discardExcess = (options.discardExcess as boolean) || false;
		const autoReconnect = options.autoReconnect !== false;
		const maxReconnectAttempts = (options.maxReconnectAttempts as number) || 5;

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

		// Initialize batcher if enabled
		let batcher: EventBatcher | null = null;
		if (throttleEnabled) {
			batcher = new EventBatcher({
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

		// Helper function to create item from event data
		const createItem = (eventName: string, data: any) => {
			// Parse stats JSON string to object for better usability
			let processedData = data;
			if (
				eventName === 'stats' &&
				Array.isArray(data) &&
				data.length > 0 &&
				typeof data[0] === 'string'
			) {
				try {
					processedData = [JSON.parse(data[0])];
				} catch (error) {
					console.warn('[PterodactylWebsocketTrigger] Failed to parse stats JSON:', error);
					// Keep original data if parsing fails
				}
			}

			return {
				json: {
					event: eventName,
					timestamp: new Date().toISOString(),
					serverId,
					data: processedData,
					...(includeRawData && { raw: { event: eventName, args: data } }),
				},
			};
		};

		// Set up event handlers
		const handleEvent = (eventName: string) => {
			return (data: any) => {
				if (!shouldEmit(eventName)) return;

				// Emit with or without batching
				if (batcher) {
					batcher.add({ event: eventName, args: data }, (events) => {
						// Create items for all events in the batch
						const items = events.map((evt) => createItem(evt.event, evt.args));
						this.emit([this.helpers.returnJsonArray(items)]);
					});
				} else {
					const item = createItem(eventName, data);
					this.emit([this.helpers.returnJsonArray([item])]);
				}
			};
		};

		// Register handlers for all possible events
		// Based on official Pterodactyl WebSocket API documentation
		const eventNames = [
			'console output',
			'status',
			'stats',
			'daemon message',
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
			// Emit sample data for each event type to demonstrate different outputs
			// Stats are automatically parsed to objects for better usability
			const timestamp = new Date().toISOString();

			const sampleEvents = [
				{
					json: {
						event: 'console output',
						timestamp,
						serverId,
						data: ['[10:30:45] [Server thread/INFO]: Sample console output - server is running'],
					},
				},
				{
					json: {
						event: 'status',
						timestamp,
						serverId,
						data: ['running'],
					},
				},
				{
					json: {
						event: 'stats',
						timestamp,
						serverId,
						data: [
							{
								memory_bytes: 536870912,
								memory_limit_bytes: 1073741824,
								cpu_absolute: 45.5,
								disk_bytes: 2147483648,
								network: {
									rx_bytes: 1048576,
									tx_bytes: 524288,
								},
								state: 'running',
								uptime: 3600,
							},
						],
					},
				},
				{
					json: {
						event: 'daemon message',
						timestamp,
						serverId,
						data: ['Sample daemon message - server container started successfully'],
					},
				},
			];

			// Emit all sample events
			this.emit([this.helpers.returnJsonArray(sampleEvents)]);
		};

		// Return close function for cleanup
		const closeFunction = async () => {
			console.log('[PterodactylWebsocketTrigger] Closing connection');
			if (batcher) {
				batcher.clear();
			}
			wsManager.close();
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}
