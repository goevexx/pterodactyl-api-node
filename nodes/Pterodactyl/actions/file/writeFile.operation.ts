import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const writeFileOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['write'],
			},
		},
		placeholder: '11',
		default: '',
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
	const serverId = this.getNodeParameter('serverId', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const content = this.getNodeParameter('content', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
		`/servers/${serverId}/files/write`,
		{},
		{ file: filePath },
		{ body: content, json: false },
	);
	return { success: true, filePath };
}
