import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getAccountOperation: INodeProperties[] = [];

export async function getAccount(this: IExecuteFunctions, index: number): Promise<any> {
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		'/account',
		{},
		{},
		{},
		index,
	);
	return response;
}
