import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createNodeOperation: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Node name',
	},
	{
		displayName: 'Location ID',
		name: 'locationId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 1,
		description: 'Location ID',
	},
	{
		displayName: 'FQDN',
		name: 'fqdn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Fully qualified domain name for the node',
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
				operation: ['create'],
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
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 'https',
		description: 'Connection scheme for the node',
	},
	{
		displayName: 'Memory',
		name: 'memory',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 1024,
		description: 'Total memory in MB',
	},
	{
		displayName: 'Memory Overallocate',
		name: 'memoryOverallocate',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Percentage of memory to overallocate (e.g., 20 for 20%). Use -1 to disable checking.',
	},
	{
		displayName: 'Disk',
		name: 'disk',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 10240,
		description: 'Total disk space in MB',
	},
	{
		displayName: 'Disk Overallocate',
		name: 'diskOverallocate',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'Percentage of disk space to overallocate (e.g., 20 for 20%). Use -1 to disable checking.',
	},
	{
		displayName: 'Upload Size',
		name: 'uploadSize',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 100,
		description: 'Maximum upload size in MB for the daemon',
	},
	{
		displayName: 'Daemon Base Directory',
		name: 'daemonBase',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: '/var/lib/pterodactyl/volumes',
		description: 'Daemon base directory path for server data storage',
		placeholder: '/var/lib/pterodactyl/volumes',
	},
	{
		displayName: 'Daemon SFTP Port',
		name: 'daemonSftp',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
			},
		},
		default: 2022,
		description: 'Port for SFTP connections to the daemon',
	},
	{
		displayName: 'Daemon Listen Port',
		name: 'daemonListen',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['create'],
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
				operation: ['create'],
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
				operation: ['create'],
			},
		},
		default: true,
		description: 'Whether the node is publicly accessible for automatic allocation',
	}
];

export async function createNode(this: IExecuteFunctions, index: number): Promise<any> {
	const name = this.getNodeParameter('name', index) as string;
	const locationId = this.getNodeParameter('locationId', index) as number;
	const fqdn = this.getNodeParameter('fqdn', index) as string;
	const scheme = this.getNodeParameter('scheme', index) as string;
	const memory = this.getNodeParameter('memory', index) as number;
	const memoryOverallocate = this.getNodeParameter('memoryOverallocate', index) as number;
	const disk = this.getNodeParameter('disk', index) as number;
	const diskOverallocate = this.getNodeParameter('diskOverallocate', index) as number;
	const daemonBase = this.getNodeParameter('daemonBase', index) as string;
	const daemonSftp = this.getNodeParameter('daemonSftp', index) as number;
	const daemonListen = this.getNodeParameter('daemonListen', index) as number;
	const publicNode = this.getNodeParameter('public', index, true) as boolean;
	const behindProxy = this.getNodeParameter('behindProxy', index, false) as boolean;
	const maintenanceMode = this.getNodeParameter('maintenanceMode', index, false) as boolean;
	const uploadSize = this.getNodeParameter('uploadSize', index, 100) as number;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/nodes`,
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
			upload_size: uploadSize
		},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
