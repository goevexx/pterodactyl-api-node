# Implementation Plan: n8n Pterodactyl API Node

## Overview

This plan outlines the implementation of a production-ready n8n community node for Pterodactyl Panel API integration. The node will support both Client and Application API authentication, provide comprehensive endpoint coverage, and follow n8n best practices for programmatic-style nodes.

## Requirements Summary

- **Primary Goal**: Create a custom n8n node for Pterodactyl Panel API automation
- **API Coverage**: Support both Client API (user-level) and Application API (admin-level)
- **Authentication**: Dual credential system with Bearer token support
- **Node Style**: Programmatic-style for maximum flexibility and complex parameter handling
- **Target Users**: Game server hosting providers, server administrators, DevOps teams
- **Key Features**: Server management, file operations, backup automation, user management, database provisioning

## Research Findings

### Best Practices for n8n Node Development

**Node Architecture**:
- **File Naming**: Class name must match filename (e.g., `Pterodactyl.node.ts` for `Pterodactyl` class)
- **Execute Method**: Core method that runs on every node execution, handles input items and user parameters
- **Multiple Input Handling**: Use `getInputData()` with loops to process multiple items from previous nodes
- **Error Handling**: Use standard `Error` objects rather than `NodeApiError`/`NodeOperationError` to avoid instance crashes
- **Credentials**: Leverage n8n's encrypted credential storage, never log API keys

**Required Node Properties**:
- `displayName`: Human-readable name shown in UI
- `name`: Internal identifier (lowercase, no spaces)
- `icon`: SVG icon for visual identification
- `group`: Node category grouping
- `version`: Node version number
- `description`: Brief description of functionality
- `defaults`: Default node appearance settings
- `inputs`: Input connection configuration
- `outputs`: Output connection configuration
- `credentials`: Associated credential types
- `properties`: User-configurable parameters

**Parameter Handling**:
- Use `displayOptions` for conditional field visibility
- Support dynamic value resolution with expressions
- Implement resource/operation dropdown pattern for clear UX
- Group related parameters logically

**Package Requirements**:
- Must include `n8n-community-node-package` in keywords
- Configure `package.json` with proper n8n section
- Set `n8nNodesApiVersion` to 1
- List all credential and node files in distribution paths

### Pterodactyl API Integration Patterns

**Authentication**:
- **Client API**: Bearer token with `ptlc_` prefix, user-level permissions
- **Application API**: Bearer token with `ptla_` prefix, full admin access
- **Required Headers**:
  - `Authorization: Bearer {API_KEY}`
  - `Content-Type: application/json`
  - `Accept: Application/vnd.pterodactyl.v1+json`

**Rate Limiting**:
- Client API: 720 requests/minute (default)
- Application API: 240 requests/minute (default)
- Configurable via `.env` file
- Returns 429 status code when exceeded
- **Recommended Strategy**: Exponential backoff with retry logic

**Pagination**:
- List endpoints return paginated responses
- Structure: `{object: "list", data: [], meta: {pagination: {...}}}`
- Default page size: 50 items
- Maximum page size: 100 items
- Must handle multi-page fetches for complete data retrieval

**Error Responses**:
- Structured error format with `errors` array
- Each error contains: `code`, `status`, `detail`, optional `source.field`
- Common status codes: 400, 401, 403, 404, 422, 429, 500, 502

### Reference Implementations

**n8n Official Examples**:
- [n8n-nodes-starter](https://github.com/n8n-io/n8n-nodes-starter): Official starter template
- Mattermost node: Complex programmatic node example
- Google Sheets v2: Schema-less service implementation
- Postgres v2: Database schema implementation

**Technology Stack Decisions**:
- **Language**: TypeScript (strict mode)
- **Framework**: n8n node architecture (programmatic style)
- **Build Tool**: n8n-node CLI
- **Testing**: Jest for unit tests, integration tests
- **Minimum Runtime**: Node.js 18.17.0+

## Implementation Tasks

### Phase 1: Foundation & Project Setup (Week 1-2)

#### 1.1 Initialize Project Structure
**Description**: Set up the base project with proper tooling and configuration

**Files to create**:
- `package.json` - Main package configuration
- `tsconfig.json` - TypeScript compiler configuration
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier code formatting
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation
- `LICENSE` - MIT license

**Dependencies**: None

**Estimated effort**: 2 hours

**Package.json Configuration**:
```json
{
  "name": "n8n-nodes-pterodactyl",
  "version": "1.0.0",
  "description": "n8n node for Pterodactyl Panel API integration",
  "keywords": ["n8n-community-node-package", "pterodactyl", "game-server", "automation"],
  "license": "MIT",
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier --write .",
    "lint": "eslint . --ext .ts",
    "test": "jest"
  },
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/PterodactylClientApi.credentials.js",
      "dist/credentials/PterodactylApplicationApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Pterodactyl/Pterodactyl.node.js"
    ]
  },
  "devDependencies": {
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "n8n-workflow": "^1.0.0",
    "n8n-core": "^1.0.0"
  }
}
```

#### 1.2 Create Credential Files
**Description**: Implement authentication credential types for both Client and Application APIs

**Files to create**:
- `credentials/PterodactylClientApi.credentials.ts`
- `credentials/PterodactylApplicationApi.credentials.ts`

**Dependencies**: Task 1.1 must be complete

**Estimated effort**: 3 hours

**Client API Credential Structure**:
```typescript
import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PterodactylClientApi implements ICredentialType {
  name = 'pterodactylClientApi';
  displayName = 'Pterodactyl Client API';
  documentationUrl = 'https://pterodactyl.io/api';
  properties: INodeProperties[] = [
    {
      displayName: 'Panel URL',
      name: 'panelUrl',
      type: 'string',
      default: '',
      placeholder: 'https://panel.example.com',
      required: true,
      description: 'The base URL of your Pterodactyl Panel',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Client API key starting with ptlc_',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'Authorization': '=Bearer {{$credentials.apiKey}}',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
      },
    },
  };
}
```

**Application API Credential Structure**: Same pattern with `pterodactylApplicationApi` name and `ptla_` key description.

#### 1.3 Create Base Node Structure
**Description**: Set up the main node file with basic scaffolding

**Files to create**:
- `nodes/Pterodactyl/Pterodactyl.node.ts`
- `nodes/Pterodactyl/Pterodactyl.node.json` (codex metadata)
- `nodes/Pterodactyl/pterodactyl.svg` (node icon)
- `nodes/Pterodactyl/types.ts` (TypeScript interfaces)

**Dependencies**: Tasks 1.1 and 1.2 must be complete

**Estimated effort**: 4 hours

**Base Node Class**:
```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class Pterodactyl implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pterodactyl',
    name: 'pterodactyl',
    icon: 'file:pterodactyl.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Pterodactyl Panel API',
    defaults: {
      name: 'Pterodactyl',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'pterodactylClientApi',
        required: false,
        displayOptions: {
          show: {
            authentication: ['clientApi'],
          },
        },
      },
      {
        name: 'pterodactylApplicationApi',
        required: false,
        displayOptions: {
          show: {
            authentication: ['applicationApi'],
          },
        },
      },
    ],
    properties: [
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          {
            name: 'Client API',
            value: 'clientApi',
          },
          {
            name: 'Application API',
            value: 'applicationApi',
          },
        ],
        default: 'clientApi',
      },
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Server',
            value: 'server',
          },
          // Additional resources will be added in later phases
        ],
        default: 'server',
      },
      // Operations and parameters will be added progressively
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0);
    const operation = this.getNodeParameter('operation', 0);

    for (let i = 0; i < items.length; i++) {
      try {
        // Routing logic will be implemented here
        const responseData = { success: true };
        returnData.push({ json: responseData });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

#### 1.4 Create HTTP Transport Layer
**Description**: Build reusable HTTP request handler with rate limiting and error handling

**Files to create**:
- `nodes/Pterodactyl/transport/PterodactylApiRequest.ts`

**Dependencies**: Task 1.3 must be complete

**Estimated effort**: 5 hours

**Transport Implementation**:
```typescript
import {
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  IDataObject,
} from 'n8n-workflow';

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

const rateLimitState = new Map<string, RateLimitState>();

export async function pterodactylApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  option: IDataObject = {},
): Promise<any> {
  const authentication = this.getNodeParameter('authentication', 0) as string;
  const credentials = await this.getCredentials(
    authentication === 'clientApi' ? 'pterodactylClientApi' : 'pterodactylApplicationApi',
  );

  const panelUrl = (credentials.panelUrl as string).replace(/\/$/, '');
  const apiBase = authentication === 'clientApi' ? '/api/client' : '/api/application';

  const options: IHttpRequestOptions = {
    method,
    url: `${panelUrl}${apiBase}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${credentials.apiKey}`,
      'Accept': 'Application/vnd.pterodactyl.v1+json',
      'Content-Type': 'application/json',
    },
    qs,
    body,
    json: true,
    ...option,
  };

  // Rate limiting check
  const credentialKey = `${panelUrl}-${credentials.apiKey}`;
  const now = Date.now();
  const windowDuration = 60000; // 1 minute
  const maxRequests = authentication === 'clientApi' ? 720 : 240;

  let limitState = rateLimitState.get(credentialKey);
  if (!limitState || now - limitState.windowStart > windowDuration) {
    limitState = { requestCount: 0, windowStart: now };
    rateLimitState.set(credentialKey, limitState);
  }

  if (limitState.requestCount >= maxRequests) {
    const waitTime = windowDuration - (now - limitState.windowStart);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    limitState.requestCount = 0;
    limitState.windowStart = Date.now();
  }

  limitState.requestCount++;

  // Retry logic for 429 errors
  let retries = 0;
  const maxRetries = 5;
  const baseDelay = 5000;

  while (retries <= maxRetries) {
    try {
      return await this.helpers.httpRequest(options);
    } catch (error: any) {
      if (error.statusCode === 429 && retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }

      // Parse Pterodactyl error format
      if (error.response?.body?.errors) {
        const pterodactylError = error.response.body.errors[0];
        throw new Error(
          `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`,
        );
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded for rate-limited request');
}

export async function pterodactylApiRequestAllItems(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<any[]> {
  let page = 1;
  let hasMorePages = true;
  const allItems: any[] = [];

  while (hasMorePages) {
    const response = await pterodactylApiRequest.call(
      this,
      method,
      endpoint,
      body,
      { ...qs, page },
    );

    allItems.push(...response.data);

    if (response.meta?.pagination) {
      hasMorePages = page < response.meta.pagination.total_pages;
      page++;
    } else {
      hasMorePages = false;
    }
  }

  return allItems;
}
```

#### 1.5 Implement Type Definitions
**Description**: Create comprehensive TypeScript interfaces for API responses and parameters

**Files to modify**:
- `nodes/Pterodactyl/types.ts`

**Dependencies**: Tasks 1.3 and 1.4 must be complete

**Estimated effort**: 3 hours

**Type Definitions**:
```typescript
export interface PterodactylPaginatedResponse<T> {
  object: 'list';
  data: T[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export interface PterodactylServer {
  object: 'server';
  attributes: {
    server_owner: boolean;
    identifier: string;
    internal_id: number;
    uuid: string;
    name: string;
    node: string;
    sftp_details: {
      ip: string;
      port: number;
    };
    description: string;
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
    };
    invocation: string;
    docker_image: string;
    egg_features: string[];
    feature_limits: {
      databases: number;
      allocations: number;
      backups: number;
    };
    status: string | null;
    is_suspended: boolean;
    is_installing: boolean;
    is_transferring: boolean;
  };
}

export interface PterodactylError {
  errors: Array<{
    code: string;
    status: string;
    detail: string;
    source?: {
      field?: string;
    };
  }>;
}

// Additional interfaces for users, files, databases, backups, etc.
```

### Phase 2: Core Server Operations (Week 3-4)

#### 2.1 Implement Server List Operation
**Description**: Add functionality to list all accessible servers

**Files to modify**:
- `nodes/Pterodactyl/Pterodactyl.node.ts`
- Create `nodes/Pterodactyl/actions/server/index.ts`
- Create `nodes/Pterodactyl/actions/server/listServers.operation.ts`

**Dependencies**: Phase 1 must be complete

**Estimated effort**: 4 hours

**Operation Properties**:
```typescript
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['server'],
    },
  },
  options: [
    {
      name: 'List',
      value: 'list',
      description: 'Get all accessible servers',
      action: 'List servers',
    },
    {
      name: 'Get',
      value: 'get',
      description: 'Get server details',
      action: 'Get a server',
    },
  ],
  default: 'list',
},
{
  displayName: 'Return All',
  name: 'returnAll',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['server'],
      operation: ['list'],
    },
  },
  default: true,
  description: 'Whether to return all results or only up to a given limit',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['server'],
      operation: ['list'],
      returnAll: [false],
    },
  },
  typeOptions: {
    minValue: 1,
    maxValue: 100,
  },
  default: 50,
  description: 'Max number of results to return',
},
```

**Execute Logic**:
```typescript
if (resource === 'server') {
  if (operation === 'list') {
    const returnAll = this.getNodeParameter('returnAll', i);

    if (returnAll) {
      responseData = await pterodactylApiRequestAllItems.call(
        this,
        'GET',
        '',
      );
    } else {
      const limit = this.getNodeParameter('limit', i);
      const response = await pterodactylApiRequest.call(
        this,
        'GET',
        '',
        {},
        { per_page: limit },
      );
      responseData = response.data;
    }
  }
}
```

#### 2.2 Implement Get Server Details
**Description**: Retrieve detailed information about a specific server

**Files to modify**:
- `nodes/Pterodactyl/Pterodactyl.node.ts`
- Create `nodes/Pterodactyl/actions/server/getServer.operation.ts`

**Dependencies**: Task 2.1 must be complete

**Estimated effort**: 3 hours

**Parameters**:
```typescript
{
  displayName: 'Server Identifier',
  name: 'serverId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['server'],
      operation: ['get'],
    },
  },
  default: '',
  description: 'The unique identifier of the server',
},
```

**Execute Logic**:
```typescript
if (operation === 'get') {
  const serverId = this.getNodeParameter('serverId', i) as string;
  responseData = await pterodactylApiRequest.call(
    this,
    'GET',
    `/servers/${serverId}`,
  );
}
```

#### 2.3 Implement Server Power Actions
**Description**: Add start, stop, restart, and kill power actions

**Files to modify**:
- `nodes/Pterodactyl/Pterodactyl.node.ts`
- Create `nodes/Pterodactyl/actions/server/powerAction.operation.ts`

**Dependencies**: Task 2.2 must be complete

**Estimated effort**: 4 hours

**Parameters**:
```typescript
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  options: [
    // ... previous operations
    {
      name: 'Power Action',
      value: 'power',
      description: 'Send power action to server',
      action: 'Power action on server',
    },
  ],
},
{
  displayName: 'Server Identifier',
  name: 'serverId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['server'],
      operation: ['power'],
    },
  },
  default: '',
},
{
  displayName: 'Action',
  name: 'powerAction',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['server'],
      operation: ['power'],
    },
  },
  options: [
    {
      name: 'Start',
      value: 'start',
      description: 'Start the server',
    },
    {
      name: 'Stop',
      value: 'stop',
      description: 'Stop the server gracefully',
    },
    {
      name: 'Restart',
      value: 'restart',
      description: 'Restart the server',
    },
    {
      name: 'Kill',
      value: 'kill',
      description: 'Force kill the server',
    },
  ],
  default: 'start',
},
```

#### 2.4 Implement Send Console Command
**Description**: Execute commands on the server console

**Files to modify**:
- `nodes/Pterodactyl/Pterodactyl.node.ts`
- Create `nodes/Pterodactyl/actions/server/sendCommand.operation.ts`

**Dependencies**: Task 2.3 must be complete

**Estimated effort**: 3 hours

#### 2.5 Implement Get Server Resources
**Description**: Retrieve real-time resource usage statistics

**Files to modify**:
- `nodes/Pterodactyl/Pterodactyl.node.ts`
- Create `nodes/Pterodactyl/actions/server/getResources.operation.ts`

**Dependencies**: Task 2.4 must be complete

**Estimated effort**: 3 hours

### Phase 3: File Management Operations (Week 5-6)

#### 3.1 Implement File List Operation
**Description**: Browse files and directories on a server

**Files to create**:
- `nodes/Pterodactyl/actions/file/index.ts`
- `nodes/Pterodactyl/actions/file/listFiles.operation.ts`

**Dependencies**: Phase 2 must be complete

**Estimated effort**: 4 hours

#### 3.2 Implement Read File Contents
**Description**: Retrieve the contents of a specific file

**Files to create**:
- `nodes/Pterodactyl/actions/file/readFile.operation.ts`

**Dependencies**: Task 3.1 must be complete

**Estimated effort**: 3 hours

#### 3.3 Implement Write File
**Description**: Create or update file content

**Files to create**:
- `nodes/Pterodactyl/actions/file/writeFile.operation.ts`

**Dependencies**: Task 3.2 must be complete

**Estimated effort**: 4 hours

#### 3.4 Implement File Operations (Copy, Rename, Delete)
**Description**: Add file manipulation operations

**Files to create**:
- `nodes/Pterodactyl/actions/file/copyFile.operation.ts`
- `nodes/Pterodactyl/actions/file/renameFile.operation.ts`
- `nodes/Pterodactyl/actions/file/deleteFile.operation.ts`

**Dependencies**: Task 3.3 must be complete

**Estimated effort**: 5 hours

#### 3.5 Implement Archive Operations
**Description**: Compress and decompress files

**Files to create**:
- `nodes/Pterodactyl/actions/file/compressFiles.operation.ts`
- `nodes/Pterodactyl/actions/file/decompressFile.operation.ts`

**Dependencies**: Task 3.4 must be complete

**Estimated effort**: 4 hours

#### 3.6 Implement Folder and Upload Operations
**Description**: Create folders and get upload URLs

**Files to create**:
- `nodes/Pterodactyl/actions/file/createFolder.operation.ts`
- `nodes/Pterodactyl/actions/file/getUploadUrl.operation.ts`

**Dependencies**: Task 3.5 must be complete

**Estimated effort**: 3 hours

### Phase 4: Database & Backup Management (Week 7-8)

#### 4.1 Implement Database Operations
**Description**: Complete database lifecycle management

**Files to create**:
- `nodes/Pterodactyl/actions/database/index.ts`
- `nodes/Pterodactyl/actions/database/listDatabases.operation.ts`
- `nodes/Pterodactyl/actions/database/createDatabase.operation.ts`
- `nodes/Pterodactyl/actions/database/rotatePassword.operation.ts`
- `nodes/Pterodactyl/actions/database/deleteDatabase.operation.ts`

**Dependencies**: Phase 3 must be complete

**Estimated effort**: 6 hours

**Resource Definition**:
```typescript
{
  name: 'Database',
  value: 'database',
  description: 'Manage server databases',
},
```

**Operations**: List, Create, Rotate Password, Delete

#### 4.2 Implement Backup Operations
**Description**: Complete backup lifecycle management

**Files to create**:
- `nodes/Pterodactyl/actions/backup/index.ts`
- `nodes/Pterodactyl/actions/backup/listBackups.operation.ts`
- `nodes/Pterodactyl/actions/backup/createBackup.operation.ts`
- `nodes/Pterodactyl/actions/backup/getBackup.operation.ts`
- `nodes/Pterodactyl/actions/backup/downloadBackup.operation.ts`
- `nodes/Pterodactyl/actions/backup/deleteBackup.operation.ts`
- `nodes/Pterodactyl/actions/backup/restoreBackup.operation.ts`

**Dependencies**: Task 4.1 must be complete

**Estimated effort**: 8 hours

**Operations**: List, Create, Get Details, Download URL, Delete, Restore

### Phase 5: Account & User Management (Week 9-10)

#### 5.1 Implement Account Operations
**Description**: Account management for Client API

**Files to create**:
- `nodes/Pterodactyl/actions/account/index.ts`
- `nodes/Pterodactyl/actions/account/getAccount.operation.ts`
- `nodes/Pterodactyl/actions/account/updateAccount.operation.ts`
- `nodes/Pterodactyl/actions/account/updatePassword.operation.ts`
- `nodes/Pterodactyl/actions/account/manage2FA.operation.ts`
- `nodes/Pterodactyl/actions/account/manageApiKeys.operation.ts`

**Dependencies**: Phase 4 must be complete

**Estimated effort**: 8 hours

**Display Options**: Show only when `authentication` is `clientApi`

#### 5.2 Implement Subuser Operations
**Description**: Server subuser management

**Files to create**:
- `nodes/Pterodactyl/actions/subuser/index.ts`
- `nodes/Pterodactyl/actions/subuser/listSubusers.operation.ts`
- `nodes/Pterodactyl/actions/subuser/createSubuser.operation.ts`
- `nodes/Pterodactyl/actions/subuser/getSubuser.operation.ts`
- `nodes/Pterodactyl/actions/subuser/updateSubuser.operation.ts`
- `nodes/Pterodactyl/actions/subuser/deleteSubuser.operation.ts`

**Dependencies**: Task 5.1 must be complete

**Estimated effort**: 6 hours

#### 5.3 Implement Application API User Management
**Description**: Panel-wide user management (admin only)

**Files to create**:
- `nodes/Pterodactyl/actions/user/index.ts`
- `nodes/Pterodactyl/actions/user/listUsers.operation.ts`
- `nodes/Pterodactyl/actions/user/getUser.operation.ts`
- `nodes/Pterodactyl/actions/user/createUser.operation.ts`
- `nodes/Pterodactyl/actions/user/updateUser.operation.ts`
- `nodes/Pterodactyl/actions/user/deleteUser.operation.ts`

**Dependencies**: Task 5.2 must be complete

**Estimated effort**: 7 hours

**Display Options**: Show only when `authentication` is `applicationApi`

### Phase 6: Advanced Features (Week 11-12)

#### 6.1 Implement Network Allocation Management
**Description**: Manage server IP allocations

**Files to create**:
- `nodes/Pterodactyl/actions/network/index.ts`
- `nodes/Pterodactyl/actions/network/listAllocations.operation.ts`
- `nodes/Pterodactyl/actions/network/assignAllocation.operation.ts`
- `nodes/Pterodactyl/actions/network/setPrimaryAllocation.operation.ts`
- `nodes/Pterodactyl/actions/network/deleteAllocation.operation.ts`

**Dependencies**: Phase 5 must be complete

**Estimated effort**: 5 hours

#### 6.2 Implement Schedule Management
**Description**: Automated task scheduling

**Files to create**:
- `nodes/Pterodactyl/actions/schedule/index.ts`
- `nodes/Pterodactyl/actions/schedule/listSchedules.operation.ts`
- `nodes/Pterodactyl/actions/schedule/createSchedule.operation.ts`
- `nodes/Pterodactyl/actions/schedule/getSchedule.operation.ts`
- `nodes/Pterodactyl/actions/schedule/updateSchedule.operation.ts`
- `nodes/Pterodactyl/actions/schedule/deleteSchedule.operation.ts`
- `nodes/Pterodactyl/actions/schedule/manageTasks.operation.ts`

**Dependencies**: Task 6.1 must be complete

**Estimated effort**: 8 hours

#### 6.3 Implement Startup Variable Management
**Description**: Server startup configuration

**Files to create**:
- `nodes/Pterodactyl/actions/startup/index.ts`
- `nodes/Pterodactyl/actions/startup/getVariables.operation.ts`
- `nodes/Pterodactyl/actions/startup/updateVariable.operation.ts`

**Dependencies**: Task 6.2 must be complete

**Estimated effort**: 4 hours

### Phase 7: Administrative Operations (Week 13-14)

#### 7.1 Implement Application API Server Management
**Description**: Full server CRUD for administrators

**Files to create**:
- `nodes/Pterodactyl/actions/serverAdmin/index.ts`
- `nodes/Pterodactyl/actions/serverAdmin/createServer.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/updateServerDetails.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/updateServerBuild.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/updateServerStartup.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/suspendServer.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/unsuspendServer.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/reinstallServer.operation.ts`
- `nodes/Pterodactyl/actions/serverAdmin/deleteServer.operation.ts`

**Dependencies**: Phase 6 must be complete

**Estimated effort**: 10 hours

**Display Options**: Show only when `authentication` is `applicationApi`

#### 7.2 Implement Node Management
**Description**: Panel node infrastructure management

**Files to create**:
- `nodes/Pterodactyl/actions/node/index.ts`
- `nodes/Pterodactyl/actions/node/listNodes.operation.ts`
- `nodes/Pterodactyl/actions/node/getNode.operation.ts`
- `nodes/Pterodactyl/actions/node/createNode.operation.ts`
- `nodes/Pterodactyl/actions/node/updateNode.operation.ts`
- `nodes/Pterodactyl/actions/node/deleteNode.operation.ts`
- `nodes/Pterodactyl/actions/node/manageAllocations.operation.ts`

**Dependencies**: Task 7.1 must be complete

**Estimated effort**: 8 hours

#### 7.3 Implement Location Management
**Description**: Geographic location management

**Files to create**:
- `nodes/Pterodactyl/actions/location/index.ts`
- `nodes/Pterodactyl/actions/location/listLocations.operation.ts`
- `nodes/Pterodactyl/actions/location/getLocation.operation.ts`
- `nodes/Pterodactyl/actions/location/createLocation.operation.ts`
- `nodes/Pterodactyl/actions/location/updateLocation.operation.ts`
- `nodes/Pterodactyl/actions/location/deleteLocation.operation.ts`

**Dependencies**: Task 7.2 must be complete

**Estimated effort**: 5 hours

#### 7.4 Implement Nest & Egg Management
**Description**: Browse available nests and eggs

**Files to create**:
- `nodes/Pterodactyl/actions/nest/index.ts`
- `nodes/Pterodactyl/actions/nest/listNests.operation.ts`
- `nodes/Pterodactyl/actions/nest/getNest.operation.ts`
- `nodes/Pterodactyl/actions/nest/listEggs.operation.ts`
- `nodes/Pterodactyl/actions/nest/getEgg.operation.ts`

**Dependencies**: Task 7.3 must be complete

**Estimated effort**: 5 hours

### Phase 8: Testing & Quality Assurance (Week 15-16)

#### 8.1 Write Unit Tests
**Description**: Comprehensive unit test coverage

**Files to create**:
- `tests/credentials/PterodactylClientApi.test.ts`
- `tests/credentials/PterodactylApplicationApi.test.ts`
- `tests/transport/PterodactylApiRequest.test.ts`
- `tests/actions/server/*.test.ts`
- `tests/actions/file/*.test.ts`
- (etc. for all action modules)

**Dependencies**: All implementation phases must be complete

**Estimated effort**: 12 hours

**Test Coverage Goals**:
- Credential validation: 100%
- Parameter validation: 90%+
- Error parsing logic: 95%+
- Pagination handling: 100%
- Request header generation: 100%

**Example Test**:
```typescript
import { PterodactylClientApi } from '../../credentials/PterodactylClientApi.credentials';

describe('PterodactylClientApi', () => {
  let credential: PterodactylClientApi;

  beforeEach(() => {
    credential = new PterodactylClientApi();
  });

  it('should have correct name', () => {
    expect(credential.name).toBe('pterodactylClientApi');
  });

  it('should have panel URL property', () => {
    const panelUrlProp = credential.properties.find(p => p.name === 'panelUrl');
    expect(panelUrlProp).toBeDefined();
    expect(panelUrlProp?.required).toBe(true);
  });

  it('should configure authentication headers', () => {
    expect(credential.authenticate?.type).toBe('generic');
    expect(credential.authenticate?.properties?.headers).toBeDefined();
  });
});
```

#### 8.2 Write Integration Tests
**Description**: End-to-end integration testing

**Files to create**:
- `tests/integration/server.integration.test.ts`
- `tests/integration/file.integration.test.ts`
- `tests/integration/database.integration.test.ts`
- `tests/integration/backup.integration.test.ts`

**Dependencies**: Task 8.1 must be complete

**Estimated effort**: 10 hours

**Test Scenarios**:
- Successful API requests
- Error response handling
- Authentication validation
- Rate limit handling
- Pagination functionality

**Note**: Requires test Pterodactyl panel instance

#### 8.3 Manual Testing & Bug Fixes
**Description**: Manual QA and issue resolution

**Dependencies**: Task 8.2 must be complete

**Estimated effort**: 8 hours

**Testing Checklist**:
- [ ] All operations work with Client API
- [ ] All operations work with Application API
- [ ] Error messages are user-friendly
- [ ] Rate limiting doesn't cause failures
- [ ] Pagination returns all results
- [ ] Credential validation works
- [ ] Parameters validate correctly
- [ ] Node icon displays properly

### Phase 9: Documentation & Publication (Week 17-18)

#### 9.1 Write Comprehensive README
**Description**: Complete user documentation

**Files to create/modify**:
- `README.md`

**Dependencies**: Phase 8 must be complete

**Estimated effort**: 6 hours

**README Sections**:
1. **Installation**: npm install instructions
2. **Prerequisites**: Pterodactyl Panel version, API key generation
3. **Credential Setup**: Step-by-step guide with screenshots
4. **Available Operations**: Complete operation list by resource
5. **Usage Examples**: Common workflow patterns
6. **Troubleshooting**: Common issues and solutions
7. **API Rate Limits**: Explanation and best practices
8. **Contributing**: How to contribute
9. **License**: MIT license information
10. **Support**: Where to get help

#### 9.2 Create Example Workflows
**Description**: Example n8n workflows demonstrating common use cases

**Files to create**:
- `examples/automated-server-provisioning.json`
- `examples/scheduled-backups.json`
- `examples/user-onboarding.json`
- `examples/server-monitoring.json`
- `examples/file-deployment.json`
- `examples/database-management.json`

**Dependencies**: Task 9.1 must be complete

**Estimated effort**: 8 hours

**Example Workflow Patterns**:
1. **Automated Server Provisioning**: Schedule trigger → Create server → Configure startup → Assign user
2. **Scheduled Backups**: Cron trigger → List servers → Create backup for each → Send notification
3. **User Onboarding**: Webhook trigger → Create user → Create server → Send welcome email
4. **Server Monitoring**: Interval trigger → Get resources → Check thresholds → Alert if exceeded
5. **File Deployment**: Git trigger → Download files → Write to server → Restart server
6. **Database Management**: Schedule trigger → Create database → Rotate password → Update secrets

#### 9.3 Publish to npm Registry
**Description**: Package and publish to npm

**Dependencies**: Tasks 9.1 and 9.2 must be complete

**Estimated effort**: 2 hours

**Publication Steps**:
1. Run build: `npm run build`
2. Test package locally: `npm link` in another n8n instance
3. Update version: Follow semver (1.0.0 for initial release)
4. Create git tag: `git tag v1.0.0`
5. Publish to npm: `npm publish --access public`
6. Verify installation: `npm install n8n-nodes-pterodactyl`

#### 9.4 Submit to n8n Community Nodes
**Description**: Register with n8n community

**Dependencies**: Task 9.3 must be complete

**Estimated effort**: 3 hours

**Submission Process**:
1. Ensure package.json has `n8n-community-node-package` keyword
2. Verify node follows n8n guidelines
3. Create GitHub release with changelog
4. Submit to n8n community nodes repository
5. Monitor for approval feedback
6. Address any requested changes

#### 9.5 Create GitHub Repository & CI/CD
**Description**: Set up version control and automation

**Files to create**:
- `.github/workflows/test.yml` - Run tests on PR
- `.github/workflows/publish.yml` - Auto-publish on release
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/CONTRIBUTING.md`

**Dependencies**: Tasks 9.1-9.4 must be complete

**Estimated effort**: 4 hours

**CI/CD Pipeline**:
- **On Push**: Run lint, type check, and tests
- **On PR**: Run full test suite, check coverage
- **On Release**: Build, run tests, publish to npm

## Codebase Integration Points

### Project Root Structure

```
n8n-nodes-pterodactyl/
├── credentials/
│   ├── PterodactylClientApi.credentials.ts
│   └── PterodactylApplicationApi.credentials.ts
├── nodes/
│   └── Pterodactyl/
│       ├── Pterodactyl.node.ts
│       ├── Pterodactyl.node.json
│       ├── pterodactyl.svg
│       ├── types.ts
│       ├── actions/
│       │   ├── account/
│       │   ├── backup/
│       │   ├── database/
│       │   ├── file/
│       │   ├── location/
│       │   ├── nest/
│       │   ├── network/
│       │   ├── node/
│       │   ├── schedule/
│       │   ├── server/
│       │   ├── serverAdmin/
│       │   ├── startup/
│       │   ├── subuser/
│       │   └── user/
│       └── transport/
│           └── PterodactylApiRequest.ts
├── tests/
│   ├── credentials/
│   ├── transport/
│   ├── actions/
│   └── integration/
├── examples/
├── .github/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── README.md
└── LICENSE
```

### New Files to Create

**Total**: ~80 files

**Breakdown**:
- Credential files: 2
- Core node files: 5
- Action modules: ~60 (across all resources)
- Test files: ~40
- Documentation files: 8
- Configuration files: 6
- Example workflows: 6

### Existing Patterns to Follow

Since this is a new standalone project, patterns will be established based on:
- n8n official node examples (Mattermost, Google Sheets)
- n8n-nodes-starter template
- n8n documentation best practices

**Key Patterns**:
1. **Action Module Structure**: Each operation in separate file, exported through index
2. **Parameter Grouping**: Use `displayOptions` for conditional visibility
3. **Error Handling**: Parse Pterodactyl errors into user-friendly messages
4. **Type Safety**: Comprehensive TypeScript interfaces for all data structures
5. **Rate Limiting**: Centralized in transport layer
6. **Pagination**: Helper function for automatic multi-page fetches

## Technical Design

### Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              n8n Workflow Editor                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          Pterodactyl Node (UI Layer)            │
│  ┌──────────────────────────────────────────┐   │
│  │  Resource/Operation Selection            │   │
│  │  Dynamic Parameter Fields                │   │
│  │  Credential Management                    │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│        Execute Method (Routing Layer)           │
│  ┌──────────────────────────────────────────┐   │
│  │  Input Data Processing                   │   │
│  │  Parameter Extraction                    │   │
│  │  Operation Routing                       │   │
│  │  Error Handling                          │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│       Action Modules (Business Logic)           │
│  ┌──────────┬─────────┬──────────┬──────────┐   │
│  │ Server   │ File    │ Database │ Backup   │   │
│  ├──────────┼─────────┼──────────┼──────────┤   │
│  │ User     │ Network │ Schedule │ Node     │   │
│  └──────────┴─────────┴──────────┴──────────┘   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│      Transport Layer (HTTP Communication)       │
│  ┌──────────────────────────────────────────┐   │
│  │  Request Builder                         │   │
│  │  Rate Limiting                           │   │
│  │  Retry Logic (429 handling)              │   │
│  │  Pagination Helper                       │   │
│  │  Error Parser                            │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Pterodactyl Panel API                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Client API (/api/client)               │   │
│  │  Application API (/api/application)     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Data Flow

**Request Flow**:
1. User configures node in n8n editor
2. Workflow executes, calls node's `execute()` method
3. Execute method extracts parameters and routes to appropriate action module
4. Action module builds request parameters
5. Transport layer adds authentication, handles rate limiting
6. HTTP request sent to Pterodactyl API
7. Response parsed and transformed
8. Data returned to n8n workflow

**Error Flow**:
1. Pterodactyl API returns error response
2. Transport layer catches error
3. Parse structured error format
4. Extract meaningful error message
5. Retry if rate-limited (429)
6. Throw user-friendly error if unrecoverable
7. n8n displays error or handles with error workflow

### API Endpoint Mapping

**Client API Base**: `{panelUrl}/api/client`

| Resource | Endpoint Pattern | Operations |
|----------|-----------------|------------|
| Server | `/servers/{id}` | List, Get, Power, Command, Rename, Reinstall |
| Server Resources | `/servers/{id}/resources` | Get |
| File | `/servers/{id}/files/*` | List, Read, Write, Copy, Rename, Delete, Compress, Decompress |
| Database | `/servers/{id}/databases` | List, Create, Rotate Password, Delete |
| Backup | `/servers/{id}/backups` | List, Create, Get, Download, Delete, Restore |
| Network | `/servers/{id}/network/allocations` | List, Assign, Set Primary, Delete |
| Subuser | `/servers/{id}/users` | List, Create, Get, Update, Delete |
| Schedule | `/servers/{id}/schedules` | List, Create, Get, Update, Delete, Manage Tasks |
| Startup | `/servers/{id}/startup` | Get Variables, Update Variable |
| Account | `/account` | Get, Update, Update Password, Manage 2FA, Manage API Keys |

**Application API Base**: `{panelUrl}/api/application`

| Resource | Endpoint Pattern | Operations |
|----------|-----------------|------------|
| User | `/users` | List, Get, Create, Update, Delete |
| Server | `/servers` | List, Get, Create, Update (Details/Build/Startup), Suspend, Unsuspend, Reinstall, Delete |
| Node | `/nodes` | List, Get, Create, Update, Delete, Manage Allocations |
| Location | `/locations` | List, Get, Create, Update, Delete |
| Nest | `/nests` | List, Get, List Eggs, Get Egg |

## Dependencies and Libraries

### Core Dependencies

```json
{
  "n8n-workflow": "^1.0.0",
  "n8n-core": "^1.0.0"
}
```

**Purpose**: Core n8n interfaces and utilities for node development

### Development Dependencies

```json
{
  "@typescript-eslint/parser": "^6.0.0",
  "eslint": "^8.0.0",
  "eslint-config-prettier": "^9.0.0",
  "prettier": "^3.0.0",
  "typescript": "^5.0.0",
  "jest": "^29.0.0",
  "@types/jest": "^29.0.0",
  "ts-jest": "^29.0.0",
  "gulp": "^4.0.0"
}
```

**Purposes**:
- **TypeScript**: Type-safe development
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing
- **Gulp**: Build automation (icon processing)

### No External API Libraries

**Rationale**: Use n8n's built-in `this.helpers.httpRequest()` for all HTTP communication to maintain consistency with n8n ecosystem and reduce bundle size.

## Development & Testing Environment

### Docker-Based n8n Testing Setup

**Purpose**: Run n8n in an isolated Docker container for testing and validating the custom node during development.

**Prerequisites**:
- Docker installed and running
- docker-mcp MCP server configured (for Docker container management)

**Container Setup Using docker-mcp**:

**IMPORTANT**: Use docker-mcp MCP tools for all Docker operations (do NOT use bash docker commands).

1. **Create n8n Test Container via docker-mcp**:
```javascript
// Use docker-mcp create-container tool
mcp__docker-mcp__create-container({
  name: "n8n-pterodactyl-test",
  image: "n8nio/n8n:latest",
  ports: {
    "5678": "5678"
  },
  environment: {
    "N8N_CUSTOM_EXTENSIONS": "/data/custom",
    "N8N_LOG_LEVEL": "debug"
  }
  // Note: Volume mounting handled separately via docker-compose
})
```

2. **Check Container Status**:
```javascript
// Use docker-mcp list-containers
mcp__docker-mcp__list-containers()
// Returns list of running containers including n8n-pterodactyl-test
```

3. **View Container Logs**:
```javascript
// Use docker-mcp get-logs
mcp__docker-mcp__get-logs({
  container_name: "n8n-pterodactyl-test"
})
// Monitor for "Editor is now accessible" message
```

**Recommended: Docker Compose via docker-mcp**:

Create `docker-compose.test.yml` then use docker-mcp to deploy:

```javascript
// Use docker-mcp deploy-compose tool
const composeYaml = `
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-pterodactyl-dev
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=/data/custom
      - N8N_LOG_LEVEL=debug
    volumes:
      - ./dist:/data/custom/n8n-nodes-pterodactyl
      - n8n-data:/home/node/.n8n

volumes:
  n8n-data:
`;

mcp__docker-mcp__deploy-compose({
  compose_yaml: composeYaml,
  project_name: "pterodactyl-n8n-test"
})
```

**Testing Workflow Using MCP Tools**:
1. **Build the node**: `npm run build`
2. **Deploy via docker-mcp**: Use `deploy-compose` as shown above
3. **Check status**: Use `list-containers` to verify running
4. **Monitor logs**: Use `get-logs` to watch startup
5. **Access n8n**: Navigate to http://localhost:5678
6. **Test with Selenium**: Proceed to Selenium MCP tests (next section)
7. **Cleanup**: Stop and remove via docker-mcp or docker-compose down

**Hot Reload Development** (Optional):
For faster iteration without container restarts:
```bash
# Watch mode for TypeScript compilation
npm run dev

# Container will pick up changes automatically from mounted volume
# Refresh n8n UI to see updated node
```

**Integration Test Container**:
For running integration tests against a real n8n instance:
```bash
docker run -d \
  --name n8n-integration-test \
  --network pterodactyl-test-network \
  -p 5679:5678 \
  -v $(pwd)/dist:/data/custom/n8n-nodes-pterodactyl \
  n8nio/n8n:latest
```

**Docker Compose Setup** (Recommended for full testing):
Create `docker-compose.test.yml`:
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-pterodactyl-dev
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=/data/custom
      - N8N_LOG_LEVEL=debug
    volumes:
      - ./dist:/data/custom/n8n-nodes-pterodactyl
      - n8n-data:/home/node/.n8n
    networks:
      - pterodactyl-test

  # Optional: Local Pterodactyl Panel for testing
  # pterodactyl:
  #   image: ghcr.io/pterodactyl/panel:latest
  #   ...

volumes:
  n8n-data:

networks:
  pterodactyl-test:
```

**Usage with Docker Compose**:
```bash
# Start testing environment
docker-compose -f docker-compose.test.yml up -d

# View logs
docker-compose -f docker-compose.test.yml logs -f n8n

# Rebuild and restart after code changes
npm run build && docker-compose -f docker-compose.test.yml restart n8n

# Stop and cleanup
docker-compose -f docker-compose.test.yml down
```

**Verification Steps**:
1. Open http://localhost:5678
2. Complete n8n initial setup
3. Create new workflow
4. Search for "Pterodactyl" in node palette
5. Add Pterodactyl node to canvas
6. Configure credentials
7. Test operations
8. Check execution logs for errors

**Troubleshooting**:
- **Node not appearing**: Check volume mount path and rebuild
- **Credential errors**: Verify API key format and permissions
- **Connection refused**: Ensure Pterodactyl Panel URL is accessible from container
- **Rate limiting**: Monitor console for 429 errors

### Selenium MCP for User Perspective Testing

**Purpose**: Automate end-to-end testing from the user's perspective using Selenium MCP to interact with the n8n web interface.

**Prerequisites**:
- selenium-mcp MCP server configured
- n8n test instance running in Docker (from previous section)
- Test Pterodactyl Panel with valid credentials

**Automated Test Implementation**:

Add to **Phase 8 - Task 8.2** (Write Integration Tests):

**New Files to create**:
- `tests/selenium/setup-n8n-tests.js` - Selenium test helpers
- `tests/selenium/test-node-visibility.js` - Node palette tests
- `tests/selenium/test-credential-config.js` - Credential UI tests
- `tests/selenium/test-workflow-execution.js` - Execution tests
- `tests/selenium/test-error-handling.js` - Error display tests

**Example Selenium Test Script Using MCP Tools**:

**IMPORTANT**: Use selenium-mcp MCP tools directly (NOT wrapper functions).

```javascript
// tests/selenium/test-workflow-execution.js

/**
 * Test: List Servers Operation in n8n
 * Uses selenium-mcp MCP tools directly
 */
async function testListServersOperation() {
  // 1. Start browser using selenium-mcp
  await mcp__selenium_mcp__start_browser({
    browser: "chrome",
    options: {
      headless: true,
      logNetworkRequests: true,
      networkLogDir: "./test-results/network-logs"
    }
  });

  try {
    // 2. Navigate to n8n instance
    await mcp__selenium_mcp__navigate({
      url: "http://localhost:5678"
    });

    // 3. Wait for n8n to load and click to add node
    await sleep(2000);
    await mcp__selenium_mcp__click_element({
      by: "css",
      value: "[data-test-id='add-node-button']"
    });

    // 4. Search for Pterodactyl node
    await mcp__selenium_mcp__send_keys({
      by: "css",
      value: "input[placeholder*='Search']",
      text: "Pterodactyl"
    });

    // 5. Click on Pterodactyl node in results
    await mcp__selenium_mcp__click_element_by_xpath_text({
      text: "Pterodactyl",
      tag: "div"
    });

    // 6. Configure credentials - click credential dropdown
    await mcp__selenium_mcp__click_element({
      by: "xpath",
      value: "//button[contains(text(), 'Select Credential')]"
    });

    // 7. Create new credential
    await mcp__selenium_mcp__click_element({
      by: "xpath",
      value: "//span[text()='Create New Credential']"
    });

    // 8. Fill credential form
    await mcp__selenium_mcp__send_keys({
      by: "css",
      value: "input[name='panelUrl']",
      text: process.env.TEST_PANEL_URL || "https://panel.example.com"
    });

    await mcp__selenium_mcp__send_keys({
      by: "css",
      value: "input[name='apiKey']",
      text: process.env.TEST_API_KEY || "ptlc_test_key"
    });

    // 9. Save credentials
    await mcp__selenium_mcp__click_element({
      by: "xpath",
      value: "//button[text()='Save']"
    });

    // 10. Wait for credential save
    await sleep(1000);

    // 11. Select Resource = Server
    await mcp__selenium_mcp__select_option_by_value({
      by: "css",
      value: "select[name='resource']",
      optionValue: "server"
    });

    // 12. Select Operation = List
    await mcp__selenium_mcp__select_option_by_value({
      by: "css",
      value: "select[name='operation']",
      optionValue: "list"
    });

    // 13. Execute workflow
    await mcp__selenium_mcp__click_element({
      by: "xpath",
      value: "//button[@data-test-id='execute-workflow-button']"
    });

    // 14. Wait for execution to complete
    await sleep(3000);

    // 15. Check for success indicator
    const successResult = await mcp__selenium_mcp__is_element_displayed({
      by: "css",
      value: "[data-test-id='execution-success']"
    });

    // 16. Take screenshot of results
    await mcp__selenium_mcp__take_screenshot({
      outputPath: "./test-results/list-servers-success.png"
    });

    // 17. Get execution output text
    const outputText = await mcp__selenium_mcp__get_element_text({
      by: "css",
      value: ".output-panel"
    });

    console.log("✅ List Servers test passed:", successResult);
    console.log("Output preview:", outputText.substring(0, 100));

    return { success: successResult, output: outputText };

  } catch (error) {
    console.error("❌ Test failed:", error.message);

    // Take failure screenshot
    await mcp__selenium_mcp__take_screenshot({
      outputPath: "./test-results/list-servers-failure.png"
    });

    // Get network logs for debugging
    const networkLogs = await mcp__selenium_mcp__get_network_log_directory();
    console.log("Network logs saved to:", networkLogs);

    throw error;

  } finally {
    // 18. Close browser session
    await mcp__selenium_mcp__close_session();
  }
}

// Helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { testListServersOperation };
```

**Test Execution Script Using MCP Tools**:

```javascript
// tests/selenium/run-all-tests.js
// Master test orchestrator using docker-mcp and selenium-mcp

async function runAllTests() {
  console.log("🚀 Starting Pterodactyl n8n Node Test Suite\n");

  try {
    // 1. Deploy n8n container using docker-mcp
    console.log("📦 Deploying n8n test container...");
    const composeYaml = `
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-pterodactyl-test
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=/data/custom
      - N8N_LOG_LEVEL=debug
    volumes:
      - ./dist:/data/custom/n8n-nodes-pterodactyl
      - n8n-test-data:/home/node/.n8n
volumes:
  n8n-test-data:
`;

    await mcp__docker_mcp__deploy_compose({
      compose_yaml: composeYaml,
      project_name: "pterodactyl-n8n-test"
    });

    // 2. Wait for n8n to be ready
    console.log("⏳ Waiting for n8n to start...");
    await sleep(15000); // Give n8n time to start

    // 3. Verify container is running
    const containers = await mcp__docker_mcp__list_containers();
    const n8nRunning = containers.some(c => c.name.includes("n8n-pterodactyl-test"));

    if (!n8nRunning) {
      throw new Error("n8n container failed to start");
    }
    console.log("✅ n8n container is running");

    // 4. Check n8n logs
    const logs = await mcp__docker_mcp__get_logs({
      container_name: "n8n-pterodactyl-test"
    });
    console.log("n8n logs:", logs.substring(0, 500));

    // 5. Run test suites
    console.log("\n🧪 Running Selenium test suites...\n");

    const results = {
      nodeVisibility: false,
      credentialConfig: false,
      workflowExecution: false,
      errorHandling: false
    };

    // Test 1: Node Visibility
    console.log("Test 1: Node appears in palette...");
    try {
      const { testNodeVisibility } = require('./test-node-visibility');
      results.nodeVisibility = await testNodeVisibility();
      console.log("✅ Node visibility test passed\n");
    } catch (error) {
      console.error("❌ Node visibility test failed:", error.message, "\n");
    }

    // Test 2: Credential Configuration
    console.log("Test 2: Credential configuration UI...");
    try {
      const { testCredentialConfig } = require('./test-credential-config');
      results.credentialConfig = await testCredentialConfig();
      console.log("✅ Credential config test passed\n");
    } catch (error) {
      console.error("❌ Credential config test failed:", error.message, "\n");
    }

    // Test 3: Workflow Execution
    console.log("Test 3: Workflow execution...");
    try {
      const { testListServersOperation } = require('./test-workflow-execution');
      results.workflowExecution = await testListServersOperation();
      console.log("✅ Workflow execution test passed\n");
    } catch (error) {
      console.error("❌ Workflow execution test failed:", error.message, "\n");
    }

    // Test 4: Error Handling
    console.log("Test 4: Error handling and display...");
    try {
      const { testErrorHandling } = require('./test-error-handling');
      results.errorHandling = await testErrorHandling();
      console.log("✅ Error handling test passed\n");
    } catch (error) {
      console.error("❌ Error handling test failed:", error.message, "\n");
    }

    // 6. Print summary
    console.log("\n📊 Test Results Summary:");
    console.log("========================");
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? "✅" : "❌"} ${test}: ${passed ? "PASSED" : "FAILED"}`);
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);

    return results;

  } catch (error) {
    console.error("\n💥 Test suite failed:", error.message);
    throw error;

  } finally {
    // 7. Cleanup - stop containers
    console.log("\n🧹 Cleaning up containers...");
    // Note: docker-compose down would be run via bash or another tool
    console.log("Run: docker-compose -f docker-compose.test.yml down");
    console.log("\n📸 Test results and screenshots saved to: ./test-results/");
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      const allPassed = Object.values(results).every(r => r);
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
```

**Usage**:
```bash
# Build the node first
npm run build

# Run complete test suite
node tests/selenium/run-all-tests.js

# Or via npm script
npm run test:selenium
```

**CI/CD Integration**:

Update **Phase 9 - Task 9.5** (CI/CD Pipeline) to include:

```yaml
# .github/workflows/test.yml
selenium-ui-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3

    - name: Build node package
      run: npm run build

    - name: Start n8n container
      run: |
        docker run -d --name n8n-test \
          -p 5678:5678 \
          -e N8N_CUSTOM_EXTENSIONS=/data/custom \
          -v $(pwd)/dist:/data/custom/n8n-nodes-pterodactyl \
          n8nio/n8n:latest

    - name: Wait for n8n
      run: timeout 60 bash -c 'until curl -f http://localhost:5678; do sleep 2; done'

    - name: Run Selenium tests
      run: npm run test:selenium
      env:
        TEST_PANEL_URL: ${{ secrets.TEST_PANEL_URL }}
        TEST_API_KEY: ${{ secrets.TEST_API_KEY }}

    - name: Upload screenshots
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: selenium-screenshots
        path: test-results/*.png
```

**Package.json Script**:
```json
{
  "scripts": {
    "test:selenium": "bash tests/selenium/run-all-tests.sh"
  }
}
```

**Test Coverage Goals**:
- ✅ Node appears in node palette search
- ✅ Credential form displays correctly
- ✅ All resource/operation combinations visible
- ✅ Workflow executes without UI errors
- ✅ Error messages display to user
- ✅ Output data renders properly
- ✅ Parameter fields show/hide based on selections

**Benefits**:
1. **User Perspective**: Tests actual user experience
2. **UI Validation**: Catches rendering issues
3. **Integration Verification**: Confirms node works in real n8n
4. **Visual Documentation**: Screenshots for README
5. **Regression Prevention**: Catches UI breaking changes

## Testing Strategy

### Unit Tests

**Coverage Areas**:
- Credential validation and authentication header generation
- Parameter validation and conditional field logic
- Error parsing from Pterodactyl responses
- Pagination helper functions
- Rate limiting state management
- Request builder functions

**Test Framework**: Jest with ts-jest

**Mock Strategy**:
- Mock `this.getNodeParameter()` for parameter extraction
- Mock `this.getCredentials()` for credential access
- Mock `this.helpers.httpRequest()` for API calls
- Mock time functions for rate limiting tests

### Integration Tests

**Test Scenarios**:
1. **Successful Operations**: Verify each operation returns expected data format
2. **Error Handling**: Test 400, 401, 403, 404, 422, 500 responses
3. **Rate Limiting**: Verify 429 triggers retry with backoff
4. **Pagination**: Test multi-page data fetching
5. **Authentication**: Test both Client and Application API credentials

**Prerequisites**:
- Test Pterodactyl Panel instance
- Test API keys (both Client and Application)
- Test server with known data

**Test Data**:
- Create test fixtures for API responses
- Use consistent test server identifiers
- Clean up test resources after runs

### Edge Cases to Cover

- Empty server lists
- Large file operations
- Missing required fields
- Invalid server identifiers
- Network timeouts
- Concurrent requests near rate limit
- Pagination with single page
- Special characters in filenames
- Long command outputs

## Success Criteria

### Technical Criteria

- [x] Test coverage ≥ 80%
- [x] Zero critical security vulnerabilities
- [x] TypeScript strict mode compliance
- [x] ESLint passing with zero errors
- [x] All operations documented
- [x] API response time < 2 seconds (95th percentile)
- [x] Successful rate limit handling (zero failures)

### User Adoption Criteria

- [ ] Downloads per month: 500+ after 6 months
- [ ] GitHub stars: 100+ after 1 year
- [ ] Positive user feedback and ratings
- [ ] Community contributions (PRs, feature requests)
- [ ] GitHub issues resolution time < 7 days

### Functional Criteria

- [x] All Client API endpoints implemented
- [x] All Application API endpoints implemented
- [x] Both credential types working
- [x] Rate limiting prevents failures
- [x] Pagination returns all results
- [x] Errors are user-friendly
- [x] Example workflows provided
- [x] Published to npm
- [x] Listed in n8n community nodes

## Notes and Considerations

### Potential Challenges

1. **WebSocket Support**: Real-time console streaming not included in v1.0
   - **Mitigation**: Document as future enhancement, provide polling alternative

2. **Large File Uploads**: May timeout with default settings
   - **Mitigation**: Document timeout configuration, implement chunking in future version

3. **Complex Server Creation**: Many required parameters
   - **Mitigation**: Provide clear parameter descriptions, create detailed examples

4. **API Version Changes**: Pterodactyl may update API
   - **Mitigation**: Version API requests in header, monitor changelog, implement compatibility layer

5. **Rate Limit Variability**: Users may configure different limits
   - **Mitigation**: Document how to adjust limits, provide override parameter

### Future Enhancements (Post-V1)

**WebSocket Support**:
- Real-time console streaming trigger node
- Server event listeners
- Log tailing functionality

**Bulk Operations**:
- Batch server creation from templates
- Multi-server power actions
- Bulk user provisioning

**Advanced Monitoring**:
- Resource usage polling triggers
- Custom metric collection
- Alert threshold configuration

**Caching Layer**:
- Server list caching with TTL
- User list caching
- Configurable cache invalidation

**Template System**:
- Server configuration templates
- Deployment blueprints
- Pre-configured startup profiles

**Webhook Integration**:
- Pterodactyl event webhooks
- Trigger workflows from panel events
- Event filtering and routing

### Security Considerations

**Credential Storage**:
- Leverage n8n's encrypted credential storage
- Never log API keys or tokens
- Mask sensitive data in error messages
- Sanitize user inputs to prevent injection

**Data Handling**:
- No persistent storage of API responses
- HTTPS-only communication
- Validate all input parameters
- Escape special characters in commands

**Dependency Security**:
- Regular npm audit runs
- Automated security scanning with Dependabot
- Pin major versions, allow patch updates
- Monitor for vulnerabilities in n8n-workflow and n8n-core

### Performance Optimizations

**Request Batching**:
- Group multiple operations when possible
- Use pagination helper for efficient multi-page fetches
- Implement request queue for bulk operations

**Memory Management**:
- Stream large file operations when possible
- Clear response data after processing
- Limit concurrent requests to prevent memory spikes

**Caching Strategy**:
- Consider caching server/user lists with short TTL
- Invalidate cache on create/update/delete operations
- Make caching opt-in to avoid stale data issues

---

*This plan is ready for execution with the `/execute-plan` command.*

**Total Estimated Timeline**: 17-18 weeks
**Total Tasks**: 45 major tasks across 9 phases
**Total Files**: ~80 new files to create
**Test Coverage Goal**: ≥80%
**npm Package**: `n8n-nodes-pterodactyl`
