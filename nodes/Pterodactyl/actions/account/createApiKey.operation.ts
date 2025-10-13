import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

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
		placeholder: 'My API Key',
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
		placeholder: '192.168.1.1,10.0.0.0/8',
		description:
			'Comma-separated list of allowed IP addresses/ranges (leave empty for no restriction)',
	},
];

export async function createApiKey(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Create API Key operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const description = this.getNodeParameter('description', index) as string;
	const allowedIpsStr = this.getNodeParameter('allowedIps', index, '') as string;

	const body: any = { description };
	if (allowedIpsStr) {
		body.allowed_ips = allowedIpsStr.split(',').map((ip) => ip.trim());
	}
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/account/api-keys',
		body,
		{},
		{},
		index,
	);
	return response;
}
