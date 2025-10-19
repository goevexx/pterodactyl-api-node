import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listNestsOperation: INodeProperties[] = [

];

export async function listNests(this: IExecuteFunctions, index: number): Promise<any> {

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nests`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
