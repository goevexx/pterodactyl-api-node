# n8n-nodes-pterodactyl

[![npm version](https://badge.fury.io/js/n8n-nodes-pterodactyl.svg)](https://badge.fury.io/js/n8n-nodes-pterodactyl)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-pterodactyl.svg)](https://www.npmjs.com/package/n8n-nodes-pterodactyl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an n8n community node that lets you interact with the Pterodactyl Panel API in your n8n workflows.

[Pterodactyl](https://pterodactyl.io/) is an open-source game server management panel built with PHP, React, and Go.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports both Client API and Application API operations for comprehensive Pterodactyl Panel automation.

### Server Management

- **List Servers** - Get all accessible servers
- **Get Server** - Get server details
- **Power Action** - Start, stop, restart, or kill server
- **Send Command** - Execute console command
- **Get Resources** - Get server resource usage

### File Operations

- **List Files** - List files in directory
- **Read File** - Read file contents
- **Write File** - Write content to file
- **Delete File** - Delete file or folder
- **Compress Files** - Create archive
- **Decompress File** - Extract archive
- **Create Folder** - Create directory
- **Get Upload URL** - Get file upload URL

### Database Management

- **List Databases** - Get all databases
- **Create Database** - Create new database
- **Rotate Password** - Generate new password
- **Delete Database** - Remove database

### Backup Operations

- **List Backups** - Get all backups
- **Create Backup** - Create new backup
- **Get Backup** - Get backup details
- **Download Backup** - Get download URL
- **Restore Backup** - Restore from backup
- **Delete Backup** - Remove backup

### Account Operations

- **Get Account** - Get account details
- **Update Email** - Change email address
- **Update Password** - Change password
- **List API Keys** - Get all API keys
- **Create API Key** - Generate new key
- **Delete API Key** - Revoke API key

## Credentials

This node requires either:

- **Pterodactyl Client API** credentials (user-level access)
- **Pterodactyl Application API** credentials (admin-level access)

See the [Pterodactyl API documentation](https://pterodactyl.io/api/) for information on generating API keys.

## Compatibility

- Requires n8n version 0.198.0 or above
- Compatible with Pterodactyl Panel v1.0 and above

## Usage

This node provides programmatic access to all major Pterodactyl Panel operations. Select your authentication type (Client or Application API), choose a resource, and pick the operation you want to perform.

### Usage Examples

#### Example 1: Automated Server Backup

Create a scheduled workflow to backup all servers daily:

1. Schedule Trigger (daily at 3 AM)
2. Pterodactyl: List Servers
3. Loop over servers
4. Pterodactyl: Create Backup

#### Example 2: File Deployment Pipeline

Deploy config files when Git repository updates:

1. Webhook Trigger (GitHub)
2. HTTP Request: Download file
3. Pterodactyl: Write File
4. Pterodactyl: Send Command (reload config)

More examples coming in the `examples/` directory.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Pterodactyl Panel](https://pterodactyl.io/)
- [Pterodactyl API Documentation](https://pterodactyl.io/api/)

## Development

This project is under active development. Contributions are welcome!

## License

[MIT](LICENSE)

## Trademark Notice

Pterodactyl® is a registered trademark of Dane Everitt and contributors. This project is not officially affiliated with or endorsed by Pterodactyl Panel. The Pterodactyl logo is used under nominative fair use to indicate compatibility with the Pterodactyl Panel API.
