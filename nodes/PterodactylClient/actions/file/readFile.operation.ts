import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const readFileOperation: INodeProperties[] = [
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
				operation: ['read'],
			},
		},
		default: '',
		description: 'Select the server to read the file from',
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['read'],
			},
		},
		default: '',
		placeholder: '/config.yml',
	},
];

export async function readFile(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Read File operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;

	const content = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/files/contents`,
		{},
		{ file: filePath },
	);
	return { filePath, content };
}
