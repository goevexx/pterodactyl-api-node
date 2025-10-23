import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createNodeAllocationsOperation: INodeProperties[] = [
	{
		displayName: 'Node ID',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createAllocations'],
			},
		},
		default: 1,
		description: 'ID of the node to create allocations on',
	},
	{
		displayName: 'IP Address',
		name: 'ip',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createAllocations'],
			},
		},
		default: '',
		description: 'IP address for the allocations',
		placeholder: '192.168.1.100',
	},
	{
		displayName: 'Ports',
		name: 'ports',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createAllocations'],
			},
		},
		default: '',
		description: 'Comma-separated list of ports or port ranges',
		placeholder: '25565,25566-25570',
	},
	{
		displayName: 'IP Alias',
		name: 'alias',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createAllocations'],
			},
		},
		default: '',
		description: 'Optional IP alias for display purposes',
		placeholder: 'Node1-Main',
	}
];

export async function createNodeAllocations(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const ip = this.getNodeParameter('ip', index) as string;
	const ports = this.getNodeParameter('ports', index) as string;
	const alias = this.getNodeParameter('alias', index, '') as string;

	const body: any = {
		ip,
		ports: ports.split(',').map(p => p.trim()),
	};

	if (alias) {
		body.alias = alias;
	}

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/nodes/${nodeId}/allocations`,
		body,
		{},
		{},
		index,
	);

	// API should return: { object: "list", data: [{ object: "allocation", attributes: {...} }] }
	// However, there's a known bug where it returns an empty string: https://github.com/pterodactyl/panel/issues/1568

	// Check if we got valid data from the create response
	if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
		const firstItem = response.data[0];
		if (firstItem && typeof firstItem === 'object' && (firstItem.attributes || firstItem.id)) {
			return response.data.map((item: any) => item.attributes || item);
		}
	}

	// If response is empty or invalid, fetch the allocations we just created
	// This works around the API bug by listing allocations and filtering for the ones we created
	const portsArray = ports.split(',').map(p => p.trim());

	// Expand port ranges (e.g., "25566-25570" -> ["25566", "25567", "25568", "25569", "25570"])
	const expandedPorts: string[] = [];
	for (const portStr of portsArray) {
		if (portStr.includes('-')) {
			const [start, end] = portStr.split('-').map(p => parseInt(p.trim()));
			for (let port = start; port <= end; port++) {
				expandedPorts.push(String(port));
			}
		} else {
			expandedPorts.push(portStr);
		}
	}

	// Fetch all allocations for this node
	const allocationsResponse = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nodes/${nodeId}/allocations`,
		{},
		{},
		{},
		index,
	);

	console.log(allocationsResponse.data);

	// Filter allocations that match the IP and any of the ports we just created
	if (allocationsResponse?.data && Array.isArray(allocationsResponse.data)) {
		const matchingAllocations = allocationsResponse.data.filter((alloc: any) => {
			const allocAttrs = alloc.attributes || alloc;
			return allocAttrs.ip === ip && expandedPorts.includes(String(allocAttrs.port));
		});

		if (matchingAllocations.length > 0) {
			// Return the matched allocations with their full details including IDs
			return matchingAllocations.map((item: any) => item.attributes || item);
		}
	}

	// If we still can't find them, return a simple success message
	return {
		success: true,
		message: 'Allocation(s) created successfully',
		note: 'Could not retrieve allocation details. Use "List Node Allocations" to see them.',
		nodeId,
		ip,
		ports: expandedPorts,
		...(alias && { alias: alias }),
	};
}
