import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listUsersOperation: INodeProperties[] = [

];

export async function listUsers(this: IExecuteFunctions, index: number): Promise<any> {

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/users`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
