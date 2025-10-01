import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const decompressFileOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['decompress'],
			},
		},
		default: '',
	},
	{
		displayName: 'Root Directory',
		name: 'root',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['decompress'],
			},
		},
		default: '/',
		description: 'Directory containing the archive file',
	},
	{
		displayName: 'Archive File',
		name: 'file',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['decompress'],
			},
		},
		default: '',
		placeholder: 'backup.zip',
		description: 'Archive filename to decompress (supports .zip, .tar, .tar.gz, .tar.bz2)',
	},
];

export async function decompressFile(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const file = this.getNodeParameter('file', index) as string;

	await pterodactylApiRequest.call(this, 'POST', `/servers/${serverId}/files/decompress`, {
		root,
		file,
	});
	return { success: true, file };
}
