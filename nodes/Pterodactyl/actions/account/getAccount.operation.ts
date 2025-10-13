import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getAccountOperation: INodeProperties[] = [];

export async function getAccount(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Get Account operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const response = await pterodactylApiRequest.call(this, 'GET', '/account', {}, {}, {}, index);
	return response;
}
