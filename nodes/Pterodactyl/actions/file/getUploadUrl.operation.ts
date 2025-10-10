import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getUploadUrlOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getUploadUrl'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
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
	const authentication = this.getNodeParameter('authentication', index) as string;

	if (authentication === 'applicationApi') {
		throw new Error(
			'Get Upload URL operation requires Client API authentication. Please use Client API credentials or choose a different operation.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const directory = this.getNodeParameter('directory', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		`/servers/${serverId}/files/upload`,
		{},
		{ directory },
	);
	return response;
}
