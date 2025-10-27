import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createApiKeyOperation: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createApiKey'],
			},
		},
		default: '',
		description: 'Description for the API key',
	},
	{
		displayName: 'Allowed IPs',
		name: 'allowedIps',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createApiKey'],
			},
		},
		default: '',
		placeholder: '192.168.1.1, 10.0.0.0/8',
		description: 'Comma-separated list of IP addresses or CIDR ranges that can use this key',
	},
];

export async function createApiKey(this: IExecuteFunctions, index: number): Promise<any> {
	const description = this.getNodeParameter('description', index) as string;
	const allowedIpsRaw = this.getNodeParameter('allowedIps', index, '') as string;

	const allowed_ips = allowedIpsRaw ? allowedIpsRaw.split(',').map((ip) => ip.trim()) : [];

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		'/account/api-keys',
		{
			description,
			allowed_ips,
		},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
