import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const listFilesOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['list'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11)',
	},
	{
		displayName: 'Directory Path',
		name: 'directory',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['list'],
			},
		},
		default: '/',
		description: 'The directory path to list files from',
	},
];

export async function listFiles(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const directory = this.getNodeParameter('directory', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		`/servers/${serverId}/files/list`,
		{},
		{ directory },
	);
	return response.data || [];
}
