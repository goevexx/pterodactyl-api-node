import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const deleteDatabaseOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['delete'],
			},
		},
		placeholder: '11',
		default: '',
	},
	{
		displayName: 'Database ID',
		name: 'databaseId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Database identifier to delete',
	},
];

export async function deleteDatabase(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const databaseId = this.getNodeParameter('databaseId', index) as string;

	await pterodactylApiRequest.call(this, 'DELETE', `/servers/${serverId}/databases/${databaseId}`);
	return { success: true, databaseId };
}
