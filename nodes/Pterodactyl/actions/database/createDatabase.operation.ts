import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const createDatabaseOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['create'],
			},
		},
		placeholder: '11',
		default: '',
	},
	{
		displayName: 'Database Name',
		name: 'database',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'my_database',
		description: 'Database name (max 48 characters)',
	},
	{
		displayName: 'Remote Access Pattern',
		name: 'remote',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['create'],
			},
		},
		default: '%',
		placeholder: '%',
		description: 'Remote access pattern (e.g., % for all, 127.0.0.1 for localhost only)',
	},
];

export async function createDatabase(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const database = this.getNodeParameter('database', index) as string;
	const remote = this.getNodeParameter('remote', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		`/servers/${serverId}/databases`,
		{
			database,
			remote,
		},
	);
	return response;
}
