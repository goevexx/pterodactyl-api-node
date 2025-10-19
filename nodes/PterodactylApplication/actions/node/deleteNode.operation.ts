import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteNodeOperation: INodeProperties[] = [
	{
		displayName: 'Node Id',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['deleteNode'],
			},
		},
		default: 0,
		description: 'ID of the node to delete',
	}
];

export async function deleteNode(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/application',
		`/nodes/${nodeId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true };
}
