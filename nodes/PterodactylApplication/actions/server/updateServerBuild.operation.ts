import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateServerBuildOperation: INodeProperties[] = [
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
				operation: ['updateBuild'],
			},
		},
		default: '',
		description: 'The server to update',
	},

	// ========== Primary Allocation ==========
	{
		displayName: 'Primary Allocation',
		name: 'allocation',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getServerAllocations',
			loadOptionsDependsOn: ['serverId'],
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: '',
		description: 'Primary allocation for this server. Leave empty to keep current value.',
	},

	// ========== Resource Limits ==========
	{
		displayName: 'Memory Limit (MB)',
		name: 'memory',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: 0,
		description: 'Memory limit in MB. Leave empty or 0 to keep current value.',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Swap Limit (MB)',
		name: 'swap',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: 0,
		description: 'Swap limit in MB. Leave empty or 0 to keep current value.',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Disk Limit (MB)',
		name: 'disk',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: 0,
		description: 'Disk space limit in MB. Leave empty or 0 to keep current value.',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'CPU Limit (%)',
		name: 'cpu',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: 0,
		description: 'CPU limit as percentage (100 = 1 core). Leave empty or 0 to keep current value.',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'IO Weight',
		name: 'io',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: 0,
		description: 'Block IO weight (10-1000). Leave empty or 0 to keep current value.',
		typeOptions: {
			minValue: 0,
			maxValue: 1000,
		},
	},
	{
		displayName: 'CPU Threads',
		name: 'threads',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: '',
		description: 'CPU thread pinning (e.g., "0-3" or "0,2,4"). Leave empty to keep current value.',
	},

	// ========== Feature Limits ==========
	{
		displayName: 'Database Limit',
		name: 'databases',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: -1,
		description: 'Maximum databases allowed. Leave empty or -1 to keep current value.',
		typeOptions: {
			minValue: -1,
		},
	},
	{
		displayName: 'Allocation Limit',
		name: 'allocations',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: -1,
		description: 'Maximum allocations allowed. Leave empty or -1 to keep current value.',
		typeOptions: {
			minValue: -1,
		},
	},
	{
		displayName: 'Backup Limit',
		name: 'backups',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: -1,
		description: 'Maximum backups allowed. Leave empty or -1 to keep current value.',
		typeOptions: {
			minValue: -1,
		},
	},

	// ========== Advanced Options ==========
	{
		displayName: 'Disable OOM Killer',
		name: 'oomDisabled',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: false,
		description: 'Whether to disable the out-of-memory killer',
	},
	{
		displayName: 'Add Allocations',
		name: 'addAllocations',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getAvailableAllocationsForServer',
			loadOptionsDependsOn: ['serverId'],
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: [],
		description: "Available allocations from the server's node to add to this server",
	},
	{
		displayName: 'Remove Allocations',
		name: 'removeAllocations',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getServerAllocations',
			loadOptionsDependsOn: ['serverId'],
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateBuild'],
			},
		},
		default: [],
		description: 'Current allocations assigned to this server that you want to remove',
	},
];

export async function updateServerBuild(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;

	// First, fetch the current server build data
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

	// Get user input values
	const allocationInput = this.getNodeParameter('allocation', index, '') as string;
	const memoryInput = this.getNodeParameter('memory', index, 0) as number;
	const swapInput = this.getNodeParameter('swap', index, 0) as number;
	const diskInput = this.getNodeParameter('disk', index, 0) as number;
	const cpuInput = this.getNodeParameter('cpu', index, 0) as number;
	const ioInput = this.getNodeParameter('io', index, 0) as number;
	const threadsInput = this.getNodeParameter('threads', index, '') as string;
	const databasesInput = this.getNodeParameter('databases', index, -1) as number;
	const allocationsInput = this.getNodeParameter('allocations', index, -1) as number;
	const backupsInput = this.getNodeParameter('backups', index, -1) as number;
	const oomDisabledInput = this.getNodeParameter('oomDisabled', index, null) as boolean | null;
	const addAllocationsInput = this.getNodeParameter('addAllocations', index, []) as string[];
	const removeAllocationsInput = this.getNodeParameter('removeAllocations', index, []) as string[];

	// Build request body - use input values OR fall back to current values
	const body: any = {
		allocation: allocationInput ? parseInt(allocationInput, 10) : currentServer.allocation,
		memory: memoryInput > 0 ? memoryInput : currentServer.limits.memory,
		swap: swapInput > 0 ? swapInput : currentServer.limits.swap,
		disk: diskInput > 0 ? diskInput : currentServer.limits.disk,
		cpu: cpuInput > 0 ? cpuInput : currentServer.limits.cpu,
		io: ioInput > 0 ? ioInput : currentServer.limits.io,
		feature_limits: {
			databases: databasesInput >= 0 ? databasesInput : currentServer.feature_limits.databases,
			allocations:
				allocationsInput >= 0 ? allocationsInput : currentServer.feature_limits.allocations,
			backups: backupsInput >= 0 ? backupsInput : currentServer.feature_limits.backups,
		},
	};

	// Add optional fields
	if (threadsInput) {
		body.threads = threadsInput;
	}

	if (oomDisabledInput !== null) {
		body.oom_disabled = oomDisabledInput;
	}

	if (addAllocationsInput && addAllocationsInput.length > 0) {
		body.add_allocations = addAllocationsInput.map((id) => parseInt(id, 10));
	}

	if (removeAllocationsInput && removeAllocationsInput.length > 0) {
		body.remove_allocations = removeAllocationsInput.map((id) => parseInt(id, 10));
	}

	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/servers/${serverId}/build`,
		body,
		{},
		{},
		index,
	);
	return response.attributes || response;
}
