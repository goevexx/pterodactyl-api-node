import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const compressFilesOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['compress'],
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
				operation: ['compress'],
			},
		},
		default: '/',
		description: 'Parent directory containing files to compress',
	},
	{
		displayName: 'Files',
		name: 'files',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['compress'],
			},
		},
		default: '',
		placeholder: 'world,plugins,config.yml',
		description: 'Comma-separated list of files/directories to compress into archive',
	},
];

export async function compressFiles(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const filesStr = this.getNodeParameter('files', index) as string;
	const files = filesStr.split(',').map((f) => f.trim());

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		`/servers/${serverId}/files/compress`,
		{
			root,
			files,
		},
	);
	return response;
}
