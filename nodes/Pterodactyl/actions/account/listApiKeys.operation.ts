import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const listApiKeysOperation: INodeProperties[] = [];

export async function listApiKeys(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'List API Keys operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/account/api-keys',
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
