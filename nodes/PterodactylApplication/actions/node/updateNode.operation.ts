import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateNodeOperation: INodeProperties[] = [
	{
		displayName: 'Node ID',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: 1,
		description: 'ID of the node to update',
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
		description: 'Node name',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Description of the node',
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
		description: 'The location for this node',
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
		description: 'Percentage of memory to overallocate (e.g., 20 for 20%). Use -1 to disable checking.',
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
	}
];

export async function updateNode(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const name = this.getNodeParameter('name', index) as string;
	const description = this.getNodeParameter('description', index) as string;
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
	const publicNode = this.getNodeParameter('public', index) as boolean;
	const behindProxy = this.getNodeParameter('behindProxy', index) as boolean;
	const maintenanceMode = this.getNodeParameter('maintenanceMode', index) as boolean;
	const uploadSize = this.getNodeParameter('uploadSize', index) as number;

	const body: any = {};
	if (name) body.name = name;
	if (description) body.description = description;
	if (locationId) body.location_id = locationId;
	if (fqdn) body.fqdn = fqdn;
	if (scheme) body.scheme = scheme;
	if (memory) body.memory = memory;
	if (memoryOverallocate !== undefined) body.memory_overallocate = memoryOverallocate;
	if (disk) body.disk = disk;
	if (diskOverallocate !== undefined) body.disk_overallocate = diskOverallocate;
	if (daemonBase) body.daemon_base = daemonBase;
	if (daemonSftp) body.daemon_sftp = daemonSftp;
	if (daemonListen) body.daemon_listen = daemonListen;
	if (publicNode !== undefined) body.public = publicNode;
	if (behindProxy !== undefined) body.behind_proxy = behindProxy;
	if (maintenanceMode !== undefined) body.maintenance_mode = maintenanceMode;
	if (uploadSize) body.upload_size = uploadSize;

	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/nodes/${nodeId}`,
		body,
		{},
		{},
		index,
	);
	return response.attributes || response;
}
