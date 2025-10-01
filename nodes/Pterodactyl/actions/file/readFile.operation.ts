import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const readFileOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['read'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11)',
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
	const serverId = this.getNodeParameter('serverId', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;

	const content = await pterodactylApiRequest.call(
		this,
		'GET',
		`/servers/${serverId}/files/contents`,
		{},
		{ file: filePath },
	);
	return { filePath, content };
}
