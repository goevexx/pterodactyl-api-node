import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteSubuserOperation: INodeProperties[] = [
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
				resource: ['subuser'],
				operation: ['deleteSubuser'],
			},
		},
		default: '',
		description: 'Select the server containing the subuser',
	},
	{
		displayName: 'Subuser',
		name: 'uuid',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSubusersForServer',
			loadOptionsDependsOn: ['serverId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['deleteSubuser'],
			},
		},
		default: '',
		description: 'Select the subuser to delete',
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
