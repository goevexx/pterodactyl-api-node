import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateServerStartupOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'The server to update',
	},

	// ========== Egg Configuration ==========
	{
		displayName: 'Egg',
		name: 'egg',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllEggs',
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Change the egg (server type). Leave empty to keep current egg.',
	},
	{
		displayName: 'Docker Image',
		name: 'dockerImage',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDockerImagesForEggById',
			loadOptionsDependsOn: ['egg'],
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Docker image to use for this server (loaded from selected egg). Leave empty to keep current image.',
	},

	// ========== Startup Command ==========
	{
		displayName: 'Startup Command Preview',
		name: 'startupPreview',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getServerStartupCommand',
			loadOptionsDependsOn: ['serverId', 'egg'],
		},
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Read-only preview. Shows [Current] server startup command, or [New Egg Default] if you select a new egg above. To override, use the field below.',
	},
	{
		displayName: 'Override Startup Command',
		name: 'startup',
		type: 'string',
		typeOptions: {
			rows: 2,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Override the startup command. Leave empty to keep current/egg default shown above. Type Pterodactyl variables like {{SERVER_MEMORY}} directly (no expression mode). In expressions, escape braces: {{ \'\\{\\{SERVER_MEMORY\\}\\}\' }}',
		placeholder: 'Leave empty for current/egg default, or: java -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
	},

	// ========== Environment Variables ==========
	{
		displayName: 'Environment Variables',
		name: 'environment',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: {},
		description: 'Environment variables for the server. Current values are preserved. These UI values override current values. For dynamic variables from previous nodes, use the JSON field below (highest priority).',
		placeholder: 'Add Environment Variable',
		options: [
			{
				name: 'variables',
				displayName: 'Variables',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'Environment variable name',
						placeholder: 'SERVER_JARFILE',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Environment variable value',
						placeholder: 'server.jar',
					},
				],
			},
		],
	},
	{
		displayName: 'Environment Variables (JSON)',
		name: 'environmentJson',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Environment variables as JSON object. This will override both current values and UI key-values. Use expressions like {{ $json.envVars }} to inject dynamic variables from previous nodes.',
		placeholder: '{"MINECRAFT_VERSION": "1.20.1", "SERVER_NAME": "My Server"}',
	},
];

export async function updateServerStartup(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;

	// First, fetch the current server startup data
	const currentServerResponse = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/servers/${serverId}`,
		{},
		{},
		{},
		index,
	);

	const currentServer = currentServerResponse.attributes;

	// Get user inputs
	const eggInput = this.getNodeParameter('egg', index, '') as string;
	const dockerImageInput = this.getNodeParameter('dockerImage', index, '') as string;
	const startupInput = this.getNodeParameter('startup', index, '') as string;
	const environmentCollection = this.getNodeParameter('environment', index, {}) as {
		variables?: Array<{ key: string; value: string }>;
	};
	const environmentJson = this.getNodeParameter('environmentJson', index, '') as string;

	// Build request body
	const body: any = {};

	// Handle egg change
	if (eggInput) {
		const eggId = parseInt(eggInput, 10);
		body.egg = eggId;

		// If egg is changing, fetch new egg data for defaults
		// Need to find the nest for this egg by searching all nests
		const nestsResponse = await pterodactylApiRequest.call(
			this,
			'GET',
			'/api/application',
			'/nests',
			{},
			{},
			{},
			index,
		);

		const nests = nestsResponse.data || [];
		let eggData: any = null;

		// Search each nest for the egg
		for (const nest of nests) {
			try {
				const eggResponse = await pterodactylApiRequest.call(
					this,
					'GET',
					'/api/application',
					`/nests/${nest.attributes.id}/eggs/${eggId}?include=variables`,
					{},
					{},
					{},
					index,
				);
				eggData = eggResponse.attributes || eggResponse;
				break;
			} catch (e) {
				// Egg not in this nest, continue searching
				continue;
			}
		}

		if (!eggData) {
			throw new Error(`Could not find egg with ID ${eggId} in any nest`);
		}

		// Use new egg startup if no override provided
		if (!startupInput && eggData.startup) {
			body.startup = eggData.startup;
		}

		// Build environment from new egg defaults
		const environment: Record<string, string> = {};
		if (eggData.relationships?.variables?.data) {
			eggData.relationships.variables.data.forEach((variable: any) => {
				const varAttrs = variable.attributes;
				if (varAttrs.user_editable && varAttrs.default_value !== null && varAttrs.default_value !== '') {
					environment[varAttrs.env_variable] = String(varAttrs.default_value);
				}
			});
		}

		// Override with UI key-value pairs
		if (environmentCollection.variables && environmentCollection.variables.length > 0) {
			environmentCollection.variables.forEach((variable) => {
				if (variable.key) {
					environment[variable.key] = variable.value;
				}
			});
		}

		// Override with JSON input (highest priority)
		if (environmentJson && environmentJson.trim() !== '') {
			try {
				const jsonVars = JSON.parse(environmentJson);
				if (typeof jsonVars === 'object' && jsonVars !== null && !Array.isArray(jsonVars)) {
					Object.entries(jsonVars).forEach(([key, value]) => {
						environment[key] = String(value);
					});
				} else {
					throw new Error('Environment JSON must be an object with key-value pairs');
				}
			} catch (error) {
				throw new Error(`Invalid Environment Variables JSON: ${(error as Error).message}`);
			}
		}

		body.environment = environment;
	} else {
		// Egg not changing - preserve current environment and merge with user inputs
		const environment: Record<string, string> = { ...currentServer.container.environment };

		// Override with UI key-value pairs
		if (environmentCollection.variables && environmentCollection.variables.length > 0) {
			environmentCollection.variables.forEach((variable) => {
				if (variable.key) {
					environment[variable.key] = variable.value;
				}
			});
		}

		// Override with JSON input (highest priority)
		if (environmentJson && environmentJson.trim() !== '') {
			try {
				const jsonVars = JSON.parse(environmentJson);
				if (typeof jsonVars === 'object' && jsonVars !== null && !Array.isArray(jsonVars)) {
					Object.entries(jsonVars).forEach(([key, value]) => {
						environment[key] = String(value);
					});
				} else {
					throw new Error('Environment JSON must be an object with key-value pairs');
				}
			} catch (error) {
				throw new Error(`Invalid Environment Variables JSON: ${(error as Error).message}`);
			}
		}

		// API requires environment field to always be present
		body.environment = environment;
	}

	// Handle startup override
	if (startupInput) {
		body.startup = startupInput;
	}

	// Handle docker image
	if (dockerImageInput) {
		body.docker_image = dockerImageInput;
	}

	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/servers/${serverId}/startup`,
		body,
		{},
		{},
		index,
	);
	return response.attributes || response;
}
