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
				operation: ['createNode'],
			},
		},
		default: '',
		description: 'Node name',
	},
	{
		displayName: 'Location Id',
		name: 'locationId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: 0,
		description: 'Location ID',
	},
	{
		displayName: 'Fqdn',
		name: 'fqdn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: '',
		description: 'Fully qualified domain name',
	},
	{
		displayName: 'Scheme',
		name: 'scheme',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: '',
		description: 'Connection scheme (http or https)',
	},
	{
		displayName: 'Memory',
		name: 'memory',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: 0,
		description: 'Total memory in MB',
	},
	{
		displayName: 'Disk',
		name: 'disk',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: 0,
		description: 'Total disk space in MB',
	},
	{
		displayName: 'Daemonbase',
		name: 'daemonBase',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: '',
		description: 'Daemon base directory',
	},
	{
		displayName: 'Daemonsftp',
		name: 'daemonSftp',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: 0,
		description: 'Daemon SFTP port',
	},
	{
		displayName: 'Daemonlisten',
		name: 'daemonListen',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNode'],
			},
		},
		default: 0,
		description: 'Daemon listen port',
	}
];

export async function createNode(this: IExecuteFunctions, index: number): Promise<any> {
	const name = this.getNodeParameter('name', index) as string;
	const locationId = this.getNodeParameter('locationId', index) as number;
	const fqdn = this.getNodeParameter('fqdn', index) as string;
	const scheme = this.getNodeParameter('scheme', index) as string;
	const memory = this.getNodeParameter('memory', index) as number;
	const disk = this.getNodeParameter('disk', index) as number;
	const daemonBase = this.getNodeParameter('daemonBase', index) as string;
	const daemonSftp = this.getNodeParameter('daemonSftp', index) as number;
	const daemonListen = this.getNodeParameter('daemonListen', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/nodes`,
		{ name, location_id: locationId, fqdn, scheme, memory, disk, daemon_base: daemonBase, daemon_sftp: daemonSftp, daemon_listen: daemonListen },
		{},
		{},
		index,
	);
	return response;
}
