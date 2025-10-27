import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listApiKeysOperation: INodeProperties[] = [];

export async function listApiKeys(this: IExecuteFunctions, index: number): Promise<any> {
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		'/account/api-keys',
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
