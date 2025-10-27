import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getUploadUrlOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getClientServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getUploadUrl'],
			},
		},
		default: '',
		description: 'Select the server to get upload URL for',
	},
	{
		displayName: 'Directory',
		name: 'directory',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getUploadUrl'],
			},
		},
		default: '/',
		description: 'Target directory for file upload (default: /)',
	},
];

export async function getUploadUrl(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Get Upload URL operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const directory = this.getNodeParameter('directory', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/files/upload`,
		{},
		{ directory },
	);
	return response;
}
