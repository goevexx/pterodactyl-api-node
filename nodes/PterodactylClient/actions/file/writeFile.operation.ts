import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const writeFileOperation: INodeProperties[] = [
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
				operation: ['write'],
			},
		},
		default: '',
		description: 'Select the server to write the file to',
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['write'],
			},
		},
		default: '',
		placeholder: '/config.yml',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['write'],
			},
		},
		default: '',
	},
];

export async function writeFile(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Write File operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const content = this.getNodeParameter('content', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/files/write`,
		{}, // Empty body object since we're sending raw content
		{ file: filePath },
		{
			body: content, // Raw content in options
			json: false, // Disable JSON stringification
			headers: {
				'Content-Type': 'text/plain', // Send as plain text
			},
		},
	);
	return { success: true, filePath };
}
