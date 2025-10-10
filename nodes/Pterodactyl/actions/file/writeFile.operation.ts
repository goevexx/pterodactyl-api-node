import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const writeFileOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['write'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
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
	const authentication = this.getNodeParameter('authentication', index) as string;

	if (authentication === 'applicationApi') {
		throw new Error(
			'Write File operation requires Client API authentication. Please use Client API credentials or choose a different operation.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const content = this.getNodeParameter('content', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
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
