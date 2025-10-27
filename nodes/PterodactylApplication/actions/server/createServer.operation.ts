import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createServerOperation: INodeProperties[] = [
	// ========== Basic Information ==========
	{
		displayName: 'Server Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Display name for the server',
		placeholder: 'My Minecraft Server',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Optional description for this server',
	},
	{
		displayName: 'Owner User',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The user who will own this server',
	},
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'External identifier for integration with other systems (billing, management tools, etc.)',
		placeholder: 'invoice-12345',
	},

	// ========== Server Configuration ==========
	{
		displayName: 'Nest',
		name: 'nest',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getNests',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The nest containing the egg for this server type',
	},
	{
		displayName: 'Egg',
		name: 'egg',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getEggsForNest',
			loadOptionsDependsOn: ['nest'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The egg that defines server type and default configuration',
	},
	{
		displayName: 'Docker Image',
		name: 'dockerImage',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDockerImagesForEgg',
			loadOptionsDependsOn: ['nest', 'egg'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Docker image to use for this server (loaded from selected egg)',
	},
	{
		displayName: 'Startup Command (Egg Default Preview)',
		name: 'startupPreview',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getEggStartupCommand',
			loadOptionsDependsOn: ['nest', 'egg'],
		},
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Preview of the egg\'s default startup command. This is read-only. To override, use the field below.',
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
				operation: ['create'],
			},
		},
		default: '',
		description: 'Override the egg\'s default startup command. Leave empty to use the egg default shown above. Type Pterodactyl variables like {{SERVER_MEMORY}} directly (no expression mode). In expressions, escape braces: {{ \'\\{\\{SERVER_MEMORY\\}\\}\' }}',
		placeholder: 'Leave empty for egg default, or: java -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
	},

	// ========== Resource Limits ==========
	{
		displayName: 'Memory Limit (MB)',
		name: 'memory',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 1024,
		description: 'Maximum memory in megabytes the server can use',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Swap Limit (MB)',
		name: 'swap',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Maximum swap memory in megabytes (0 to disable)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Disk Limit (MB)',
		name: 'disk',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 5120,
		description: 'Maximum disk space in megabytes',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'CPU Limit (%)',
		name: 'cpu',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 100,
		description: 'CPU limit as percentage (100 = 1 core, 200 = 2 cores, etc.)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'IO Weight',
		name: 'io',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 500,
		description: 'Block IO weight (10-1000, higher = more priority)',
		typeOptions: {
			minValue: 10,
			maxValue: 1000,
		},
	},

	// ========== Feature Limits ==========
	{
		displayName: 'Database Limit',
		name: 'databases',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Maximum number of databases the server can create',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Allocation Limit',
		name: 'allocations',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 1,
		description: 'Maximum number of network allocations',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Backup Limit',
		name: 'backups',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Maximum number of backups the server can create',
		typeOptions: {
			minValue: 0,
		},
	},

	// ========== Network Configuration ==========
	{
		displayName: 'Node',
		name: 'nodeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getNodes',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The node where this server will be hosted',
	},
	{
		displayName: 'Default Allocation',
		name: 'allocationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAvailableAllocations',
			loadOptionsDependsOn: ['nodeId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The primary IP:Port allocation for this server (only shows unassigned allocations)',
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
				operation: ['create'],
			},
		},
		default: {},
		description: 'Environment variables for the server. The selected egg\'s default variables will be automatically included. These UI values override egg defaults. For dynamic variables from previous nodes, use the JSON field below (highest priority).',
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
				operation: ['create'],
			},
		},
		default: '',
		description: 'Environment variables as JSON object. This will override both egg defaults and UI key-values. Use expressions like {{ $json.envVars }} to inject dynamic variables from previous nodes.',
		placeholder: '{"MINECRAFT_VERSION": "1.20.1", "SERVER_NAME": "My Server"}',
	},

	// ========== Advanced Options ==========
	{
		displayName: 'Start After Installation',
		name: 'startOnCompletion',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to automatically start the server after installation completes',
	},
	{
		displayName: 'Skip Install Scripts',
		name: 'skipScripts',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to skip running the egg installation scripts',
	},
	{
		displayName: 'Disable OOM Killer',
		name: 'oomDisabled',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to disable the out-of-memory killer for this server',
	},
];

export async function createServer(this: IExecuteFunctions, index: number): Promise<any> {
	// Basic Information
	const name = this.getNodeParameter('name', index) as string;
	const description = this.getNodeParameter('description', index, '') as string;
	const userId = this.getNodeParameter('userId', index) as number;
	const externalId = this.getNodeParameter('externalId', index, '') as string;

	// Server Configuration
	const nestId = this.getNodeParameter('nest', index) as number;
	const eggId = this.getNodeParameter('egg', index) as number;
	const dockerImage = this.getNodeParameter('dockerImage', index) as string;
	let startup = this.getNodeParameter('startup', index, '') as string;

	// Resource Limits
	const memory = this.getNodeParameter('memory', index) as number;
	const swap = this.getNodeParameter('swap', index) as number;
	const disk = this.getNodeParameter('disk', index) as number;
	const cpu = this.getNodeParameter('cpu', index) as number;
	const io = this.getNodeParameter('io', index) as number;

	// Feature Limits
	const databases = this.getNodeParameter('databases', index) as number;
	const allocations = this.getNodeParameter('allocations', index) as number;
	const backups = this.getNodeParameter('backups', index) as number;

	// Network Configuration
	// nodeId is used for allocation dropdown selection (not needed in API request)
	const allocationId = this.getNodeParameter('allocationId', index) as number;

	// Environment Variables
	const environmentCollection = this.getNodeParameter('environment', index, {}) as {
		variables?: Array<{ key: string; value: string }>;
	};
	const environmentJson = this.getNodeParameter('environmentJson', index, '') as string;

	// Advanced Options
	const startOnCompletion = this.getNodeParameter('startOnCompletion', index, false) as boolean;
	const skipScripts = this.getNodeParameter('skipScripts', index, false) as boolean;
	const oomDisabled = this.getNodeParameter('oomDisabled', index, false) as boolean;

	// Fetch egg data for startup and environment defaults
	const eggResponse = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nests/${nestId}/eggs/${eggId}?include=variables`,
		{},
		{},
		{},
		index,
	);

	const eggData = eggResponse.attributes || eggResponse;

	// Use egg startup if not provided
	if (!startup && eggData.startup) {
		startup = eggData.startup;
	}

	// Build environment object: start with egg defaults, then override with user inputs
	const environment: Record<string, string> = {};

	// First, populate with egg variable defaults
	if (eggData.relationships?.variables?.data) {
		eggData.relationships.variables.data.forEach((variable: any) => {
			const varAttrs = variable.attributes;
			// Only include user-editable variables with default values
			if (varAttrs.user_editable && varAttrs.default_value !== null && varAttrs.default_value !== '') {
				environment[varAttrs.env_variable] = String(varAttrs.default_value);
			}
		});
	}

	// Then, override with user-provided values from UI key-value pairs
	if (environmentCollection.variables && environmentCollection.variables.length > 0) {
		environmentCollection.variables.forEach((variable) => {
			if (variable.key) {
				environment[variable.key] = variable.value;
			}
		});
	}

	// Finally, override with JSON input (highest priority)
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

	// Construct request body
	const body: any = {
		name,
		user: userId,
		egg: eggId,
		docker_image: dockerImage,
		startup: startup,
		environment: environment, // Always required by API
		limits: {
			memory,
			swap,
			disk,
			io,
			cpu,
		},
		feature_limits: {
			databases,
			allocations,
			backups,
		},
		allocation: {
			default: allocationId,
		},
	};

	// Add optional fields
	if (externalId) body.external_id = externalId;
	if (description) body.description = description;
	if (startOnCompletion) body.start_on_completion = startOnCompletion;
	if (skipScripts) body.skip_scripts = skipScripts;
	if (oomDisabled) body.oom_disabled = oomDisabled;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/servers`,
		body,
		{},
		{},
		index,
	);
	return response.attributes || response;
}
