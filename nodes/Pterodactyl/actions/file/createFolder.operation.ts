import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const createFolderOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['createFolder'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description: 'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
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
	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const name = this.getNodeParameter('name', index) as string;

	await pterodactylApiRequest.call(this, 'POST', `/servers/${serverId}/files/create-folder`, {
		root,
		name,
	}, {}, {}, index);
	return { success: true, folder: `${root}/${name}` };
}
