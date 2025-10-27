import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateNodeOperation: INodeProperties[] = [
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
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'The node to update',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Node name. Leave empty to keep current value.',
	},
	{
		displayName: 'Location',
		name: 'locationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLocations',
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'The location for this node. Leave empty to keep current value.',
	},
	{
		displayName: 'FQDN',
		name: 'fqdn',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Fully qualified domain name for the node. Leave empty to keep current value.',
		placeholder: 'node.example.com',
	},
	{
		displayName: 'Behind Proxy',
		name: 'behindProxy',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether the daemon is behind a proxy that terminates SSL connections',
	},
	{
		displayName: 'Scheme',
		name: 'scheme',
		type: 'options',
		options: [
			{
				name: 'HTTPS',
				value: 'https',
			},
			{
				name: 'HTTP',
				value: 'http',
			},
		],
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Connection scheme for the node',
	},
	{
		displayName: 'Memory',
		name: 'memory',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 1024,
		description: 'Total memory in MB',
	},
	{
		displayName: 'Memory Overallocate',
		name: 'memoryOverallocate',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 0,
		description:
			'Percentage of memory to overallocate (e.g., 20 for 20%). Use -1 to disable checking.',
	},
	{
		displayName: 'Disk',
		name: 'disk',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 10240,
		description: 'Total disk space in MB',
	},
	{
		displayName: 'Disk Overallocate',
		name: 'diskOverallocate',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 0,
		description:
			'Percentage of disk space to overallocate (e.g., 20 for 20%). Use -1 to disable checking.',
	},
	{
		displayName: 'Upload Size',
		name: 'uploadSize',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 100,
		description: 'Maximum upload size in MB for the daemon',
	},
	{
		displayName: 'Daemon Base Directory',
		name: 'daemonBase',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Daemon base directory path for server data storage',
		placeholder: '/var/lib/pterodactyl/volumes',
	},
	{
		displayName: 'Daemon SFTP Port',
		name: 'daemonSftp',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 2022,
		description: 'Port for SFTP connections to the daemon',
	},
	{
		displayName: 'Daemon Listen Port',
		name: 'daemonListen',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 8080,
		description: 'Port for Wings daemon HTTP connections',
	},
	{
		displayName: 'Maintenance Mode',
		name: 'maintenanceMode',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether the node is in maintenance mode (prevents new servers)',
	},
	{
		displayName: 'Public',
		name: 'public',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: true,
		description: 'Whether the node is publicly accessible for automatic allocation',
	},
];

export async function updateNode(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;

	// First, fetch the current node data
	const currentNodeResponse = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nodes/${nodeId}`,
		{},
		{},
		{},
		index,
	);

	const currentNode = currentNodeResponse.attributes;

	// Get user input values (empty string if not provided)
	const nameInput = this.getNodeParameter('name', index, '') as string;
	const locationIdInput = this.getNodeParameter('locationId', index, '') as string;
	const fqdnInput = this.getNodeParameter('fqdn', index, '') as string;
	const schemeInput = this.getNodeParameter('scheme', index, '') as string;
	const memoryInput = this.getNodeParameter('memory', index, 0) as number;
	const memoryOverallocateInput = this.getNodeParameter(
		'memoryOverallocate',
		index,
		-999,
	) as number;
	const diskInput = this.getNodeParameter('disk', index, 0) as number;
	const diskOverallocateInput = this.getNodeParameter('diskOverallocate', index, -999) as number;
	const daemonBaseInput = this.getNodeParameter('daemonBase', index, '') as string;
	const daemonSftpInput = this.getNodeParameter('daemonSftp', index, 0) as number;
	const daemonListenInput = this.getNodeParameter('daemonListen', index, 0) as number;
	const publicInput = this.getNodeParameter('public', index, undefined) as boolean | undefined;
	const behindProxyInput = this.getNodeParameter('behindProxy', index, undefined) as
		| boolean
		| undefined;
	const maintenanceModeInput = this.getNodeParameter('maintenanceMode', index, undefined) as
		| boolean
		| undefined;
	const uploadSizeInput = this.getNodeParameter('uploadSize', index, 0) as number;

	// Use input values OR fall back to current values
	const name = nameInput || currentNode.name;
	const locationId = locationIdInput || currentNode.location_id;
	const fqdn = fqdnInput || currentNode.fqdn;
	const scheme = schemeInput || currentNode.scheme;
	const memory = memoryInput || currentNode.memory;
	const memoryOverallocate =
		memoryOverallocateInput !== -999 ? memoryOverallocateInput : currentNode.memory_overallocate;
	const disk = diskInput || currentNode.disk;
	const diskOverallocate =
		diskOverallocateInput !== -999 ? diskOverallocateInput : currentNode.disk_overallocate;
	const daemonBase = daemonBaseInput || currentNode.daemon_base;
	const daemonSftp = daemonSftpInput || currentNode.daemon_sftp;
	const daemonListen = daemonListenInput || currentNode.daemon_listen;
	const publicNode = publicInput !== undefined ? publicInput : currentNode.public;
	const behindProxy = behindProxyInput !== undefined ? behindProxyInput : currentNode.behind_proxy;
	const maintenanceMode =
		maintenanceModeInput !== undefined ? maintenanceModeInput : currentNode.maintenance_mode;
	const uploadSize = uploadSizeInput || currentNode.upload_size;

	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/nodes/${nodeId}`,
		{
			name,
			location_id: locationId,
			fqdn,
			scheme,
			memory,
			memory_overallocate: memoryOverallocate,
			disk,
			disk_overallocate: diskOverallocate,
			daemon_base: daemonBase,
			daemon_sftp: daemonSftp,
			daemon_listen: daemonListen,
			public: publicNode,
			behind_proxy: behindProxy,
			maintenance_mode: maintenanceMode,
			upload_size: uploadSize,
		},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
