import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createFolderOperation: INodeProperties[] = [
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
				operation: ['createFolder'],
			},
		},
		default: '',
		description: 'Select the server to create folder on',
	},
	{
		displayName: 'Root Directory',
		name: 'root',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['createFolder'],
			},
		},
		default: '/',
		description: 'Parent directory where the folder will be created',
	},
	{
		displayName: 'Folder Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['createFolder'],
			},
		},
		default: '',
		placeholder: 'new-folder',
		description: 'Name of the new folder to create',
	},
];

export async function createFolder(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Create Folder operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const name = this.getNodeParameter('name', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/files/create-folder`,
		{
			root,
			name,
		},
		{},
		{},
		index,
	);
	return { success: true, folder: `${root}/${name}` };
}
