import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteSubuserOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['deleteSubuser'],
			},
		},
		default: '',
		description: 'ID of the server',
	},
	{
		displayName: 'Uuid',
		name: 'uuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['deleteSubuser'],
			},
		},
		default: '',
		description: 'UUID of the subuser to delete',
	},
];

export async function deleteSubuser(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const uuid = this.getNodeParameter('uuid', index) as string;

	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/client',
		`/servers/${serverId}/users/${uuid}`,
		{},
		{},
		{},
		index,
	);
	return { success: true };
}
