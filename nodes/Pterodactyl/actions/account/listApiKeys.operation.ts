import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const listApiKeysOperation: INodeProperties[] = [];

export async function listApiKeys(this: IExecuteFunctions, index: number): Promise<any> {
	const response = await pterodactylApiRequest.call(this, 'GET', '/account/api-keys', {}, {}, {}, index);
	return response.data || [];
}
