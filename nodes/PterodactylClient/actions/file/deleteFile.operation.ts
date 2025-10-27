import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteFileOperation: INodeProperties[] = [
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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Select the server to delete files from',
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
		description: 'Parent directory of the files to be removed',
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
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Delete File operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const filesStr = this.getNodeParameter('files', index) as string;
	const files = filesStr.split(',').map((f) => f.trim());

	await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/files/delete`,
		{
			root,
			files,
		},
		{},
		{},
		index,
	);
	return { success: true, deleted: files };
}
