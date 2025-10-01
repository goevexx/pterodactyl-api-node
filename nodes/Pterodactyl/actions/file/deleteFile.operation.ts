import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const deleteFileOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['delete'],
			},
		},
		default: '',
	},
	{
		displayName: 'Root Directory',
		name: 'root',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['delete'],
			},
		},
		default: '/',
	},
	{
		displayName: 'Files',
		name: 'files',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['delete'],
			},
		},
		default: '',
		placeholder: 'file1.txt,file2.log',
		description: 'Comma-separated list of files to delete',
	},
];

export async function deleteFile(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const filesStr = this.getNodeParameter('files', index) as string;
	const files = filesStr.split(',').map((f) => f.trim());

	await pterodactylApiRequest.call(this, 'POST', `/servers/${serverId}/files/delete`, {
		root,
		files,
	});
	return { success: true, deleted: files };
}
