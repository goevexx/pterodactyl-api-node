import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getAccountOperation: INodeProperties[] = [];

export async function getAccount(this: IExecuteFunctions): Promise<any> {
	const response = await pterodactylApiRequest.call(this, 'GET', '/account');
	return response;
}
