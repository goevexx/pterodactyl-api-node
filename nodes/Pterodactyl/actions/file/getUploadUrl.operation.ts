import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getUploadUrlOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getUploadUrl'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11)',
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
