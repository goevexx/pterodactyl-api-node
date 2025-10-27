# WebSocket Nodes - Server Dropdown Implementation

**Date:** 2025-10-24
**Status:** ✅ COMPLETE - Server dropdowns added to all WebSocket nodes

---

## Executive Summary

Applied the dependent dropdown pattern to **both WebSocket nodes** to replace manual server ID input (string) with a server dropdown that automatically fetches and displays available servers.

**Nodes Updated:**
1. **Pterodactyl WebSocket** (action node)
2. **Pterodactyl WebSocket Trigger** (trigger node)

**Result:** Users can now select servers from a dropdown instead of manually entering server IDs.

---

## Changes Made

### 1. Pterodactyl WebSocket Node

**File:** `nodes/PterodactylWebsocket/PterodactylWebsocket.node.ts`

#### Added Imports
```typescript
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,      // ← Added
	INodePropertyOptions,       // ← Added
} from 'n8n-workflow';
```

#### Added loadOptions Method
```typescript
methods = {
	loadOptions: {
		async getClientServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			try {
				const { pterodactylApiRequest } = await import('../../shared/transport');
				const response = await pterodactylApiRequest.call(
					this as unknown as IExecuteFunctions,
					'GET',
					'/api/client',
					'',
					{},
					{},
					{},
					0,
				);

				const servers = response.data || [];

				if (servers.length === 0) {
					return [{
						name: 'No servers found',
						value: '',
					}];
				}

				return servers.map((server: any) => ({
					name: `${server.attributes.name} (${server.attributes.identifier})`,
					value: server.attributes.identifier,
				}));
			} catch (error) {
				console.error('Error fetching servers:', error);
				return [{
					name: `Error: ${(error as Error).message}`,
					value: '',
				}];
			}
		},
	},
};
```

---

### 2. Server Control Operations

**File:** `nodes/PterodactylWebsocket/operations/serverControl.ts`

#### Before (String Input)
```typescript
{
	displayName: 'Server ID',
	name: 'serverId',
	type: 'string',          // ❌ Manual input
	required: true,
	displayOptions: {
		show: {
			resource: ['serverControl'],
		},
	},
	default: '',
	description: 'The ID of the server',
}
```

#### After (Dropdown)
```typescript
{
	displayName: 'Server',
	name: 'serverId',
	type: 'options',         // ✅ Dropdown
	typeOptions: {
		loadOptionsMethod: 'getClientServers',  // ✅ Fetches servers
	},
	required: true,
	displayOptions: {
		show: {
			resource: ['serverControl'],
		},
	},
	default: '',
	description: 'The server to control',
}
```

**Operations Using This:**
- Set State (start/stop/restart/kill)
- Send Command

---

### 3. Logs & Stats Operations

**File:** `nodes/PterodactylWebsocket/operations/logsAndStats.ts`

#### Updated Field
```typescript
{
	displayName: 'Server',
	name: 'serverId',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'getClientServers',
	},
	required: true,
	displayOptions: {
		show: {
			resource: ['logsAndStats'],
		},
	},
	default: '',
	description: 'The server to get logs and stats from',
}
```

**Operations Using This:**
- Request Logs
- Request Stats

---

### 4. Connection Operations

**File:** `nodes/PterodactylWebsocket/operations/connection.ts`

#### Updated Field
```typescript
{
	displayName: 'Server',
	name: 'serverId',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'getClientServers',
	},
	required: true,
	displayOptions: {
		show: {
			resource: ['connection'],
		},
	},
	default: '',
	description: 'The server to test connection for',
}
```

**Operations Using This:**
- Test Connection
- Send Auth

---

### 5. Pterodactyl WebSocket Trigger Node

**File:** `nodes/PterodactylWebsocketTrigger/PterodactylWebsocketTrigger.trigger.node.ts`

#### Added Imports
```typescript
import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
	ILoadOptionsFunctions,   // ← Added
	INodePropertyOptions,    // ← Added
	IExecuteFunctions,       // ← Added (for type casting)
} from 'n8n-workflow';
```

#### Added loadOptions Method
```typescript
methods = {
	loadOptions: {
		async getClientServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			try {
				const { pterodactylApiRequest } = await import('../../shared/transport');
				const response = await pterodactylApiRequest.call(
					this as unknown as IExecuteFunctions,
					'GET',
					'/api/client',
					'',
					{},
					{},
					{},
					0,
				);

				const servers = response.data || [];

				if (servers.length === 0) {
					return [{
						name: 'No servers found',
						value: '',
					}];
				}

				return servers.map((server: any) => ({
					name: `${server.attributes.name} (${server.attributes.identifier})`,
					value: server.attributes.identifier,
				}));
			} catch (error) {
				console.error('Error fetching servers:', error);
				return [{
					name: `Error: ${(error as Error).message}`,
					value: '',
				}];
			}
		},
	},
};
```

#### Updated Field

**Before:**
```typescript
{
	displayName: 'Server ID',
	name: 'serverId',
	type: 'string',
	default: '',
	required: true,
	description: 'The ID of the server to monitor',
	placeholder: 'e.g., a1b2c3d4',
}
```

**After:**
```typescript
{
	displayName: 'Server',
	name: 'serverId',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'getClientServers',
	},
	default: '',
	required: true,
	description: 'The server to monitor',
}
```

---

## Implementation Pattern

### Pattern Used (Consistent with Client API)

All WebSocket nodes now follow the exact same pattern as the Client API nodes:

```typescript
// 1. Field Definition
{
	displayName: 'Server',
	name: 'serverId',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'getClientServers',
	},
	required: true,
	default: '',
	description: 'The server to [perform action on]',
}

// 2. LoadOptions Method
methods = {
	loadOptions: {
		async getClientServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			// Fetch servers from Client API
			// Return array of {name, value} objects
		},
	},
};
```

### Server Display Format

Servers are displayed in the dropdown as:
```
Server Name (identifier)
```

Example:
```
My Minecraft Server (a1b2c3d4)
Production Server (b2c3d4e5)
Test Server (c3d4e5f6)
```

The **identifier** is used as the value (required by WebSocket API).

---

## Files Modified

| File | Lines Modified | Type of Change |
|------|---------------|----------------|
| `PterodactylWebsocket.node.ts` | 1-8, 72-110 | Added imports & loadOptions method |
| `operations/serverControl.ts` | 35-50 | Changed field from string to options |
| `operations/logsAndStats.ts` | 35-50 | Changed field from string to options |
| `operations/connection.ts` | 35-50 | Changed field from string to options |
| `PterodactylWebsocketTrigger.trigger.node.ts` | 1-10, 33-43, 159-197 | Added imports, loadOptions & updated field |

**Total Files Modified:** 5
**Total Operations Updated:** 6 (Set State, Send Command, Request Logs, Request Stats, Test Connection, Send Auth) + 1 Trigger

---

## User Experience Improvements

### Before
❌ Users had to:
1. Open Pterodactyl panel in browser
2. Navigate to server
3. Copy server identifier from URL or server details
4. Paste into n8n node field
5. Risk typos or wrong server ID

### After
✅ Users can now:
1. Click the dropdown in n8n
2. See all available servers with names
3. Select the correct server visually
4. No risk of typos
5. Faster workflow setup

---

## Dropdown Behavior

### Server Fetching
- Servers are fetched via Client API: `GET /api/client`
- Returns all servers the user has access to
- Automatically formatted with names and identifiers

### Empty State
If no servers found:
```
Dropdown shows: "No servers found"
```

### Error State
If API error occurs:
```
Dropdown shows: "Error: [error message]"
```

### Loaded State
Normal operation:
```
Server Name 1 (identifier1)
Server Name 2 (identifier2)
Server Name 3 (identifier3)
...
```

---

## Technical Implementation Details

### Type Safety

**ILoadOptionsFunctions Context:**
```typescript
async getClientServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>
```

**Type Casting for API Call:**
```typescript
this as unknown as IExecuteFunctions
```
- Required because `pterodactylApiRequest` expects `IExecuteFunctions`
- `ILoadOptionsFunctions` provides limited context for security
- Type casting is safe here (standard n8n pattern)

### Class Property vs Description Property

**IMPORTANT:** In n8n nodes, `methods` is a **class property**, not part of the `description` object:

```typescript
export class PterodactylWebsocket implements INodeType {
	description: INodeTypeDescription = {
		// ... properties, credentials, etc.
	};

	methods = {  // ← Class property, NOT inside description
		loadOptions: {
			// ...
		},
	};

	async execute(this: IExecuteFunctions) {
		// ...
	}
}
```

This is consistent across all n8n node types (regular, trigger, webhook, etc.).

---

## Compatibility

### API Compatibility
- Uses Client API endpoint: `/api/client`
- Returns server identifiers (used by WebSocket API)
- Same format as existing Client API nodes

### Backward Compatibility
- ⚠️ **Breaking Change**: Field type changed from `string` to `options`
- Existing workflows with hardcoded server IDs will need to be reconfigured
- Benefit: Much better UX, reduces errors

### Forward Compatibility
- Pattern matches all Client API nodes
- Can easily add more fields if needed (e.g., server filters, search)

---

## Testing Recommendations

After deployment, test the following:

### Pterodactyl WebSocket Node

**Server Control Resource:**
1. ✅ Select Server → Verify dropdown shows all servers
2. ✅ Select server → Set State (Start) → Verify WebSocket connects and changes state
3. ✅ Select server → Send Command → Verify command is sent
4. ✅ Empty state → Verify "No servers found" message

**Logs & Stats Resource:**
5. ✅ Select Server → Request Logs → Verify logs are retrieved
6. ✅ Select Server → Request Stats → Verify stats are retrieved

**Connection Resource:**
7. ✅ Select Server → Test Connection → Verify connection test works
8. ✅ Select Server → Send Auth → Verify re-authentication works

### Pterodactyl WebSocket Trigger Node

9. ✅ Select Server → Choose Events → Verify trigger activates on events
10. ✅ Empty state → Verify "No servers found" message
11. ✅ Error state → Verify error message displayed

---

## Build Verification

```bash
$ npm run build

> n8n-nodes-pterodactyl@1.2.0 build
> tsc && gulp build:icons

[15:01:10] Using gulpfile ~/pterodactyl-api-node/gulpfile.js
[15:01:10] Starting 'build:icons'...
[15:01:10] Finished 'build:icons' after 27 ms
```

**Result:** ✅ SUCCESS - All TypeScript compilation passed

---

## Summary

### Changes Summary
- ✅ Added `getClientServers` loadOptions method to both nodes
- ✅ Changed server ID fields from string input to dropdown (6 operations + 1 trigger)
- ✅ Maintained consistent pattern with Client API nodes
- ✅ Improved user experience significantly
- ✅ Build successful with no errors

### Impact
- **Better UX**: No more manual server ID entry
- **Fewer Errors**: Visual selection prevents typos
- **Faster Setup**: Quick server selection from dropdown
- **Consistent**: Matches pattern used across all Client API nodes

### Next Steps
1. ✅ **Build Complete** - Code compiles successfully
2. ⏳ **Restart n8n** - Load updated node code
3. ⏳ **Test All Operations** - Verify dropdowns work correctly
4. ⏳ **Update Existing Workflows** - Reconfigure workflows using hardcoded server IDs

**Implementation Completed:** 2025-10-24
**Status:** ✅ COMPLETE - Ready for deployment and testing
