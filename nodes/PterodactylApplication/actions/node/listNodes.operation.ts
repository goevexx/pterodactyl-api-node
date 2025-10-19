import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listNodesOperation: INodeProperties[] = [

];

export async function listNodes(this: IExecuteFunctions, index: number): Promise<any> {

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nodes`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
