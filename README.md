# n8n-nodes-pterodactyl

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

**Available Resources:**
- Server Management (list, get, power actions, console commands, resources)
- File Operations (list, read, write, copy, rename, delete, compress, decompress)
- Database Management (list, create, rotate password, delete)
- Backup Operations (list, create, get, download, delete, restore)
- Network Allocations (list, assign, set primary, delete)
- User Management (account, subusers, panel users)
- Scheduling (create and manage automated tasks)
- And more...

Full operation documentation coming soon.

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

Detailed usage examples will be added in the `examples/` directory.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Pterodactyl Panel](https://pterodactyl.io/)
* [Pterodactyl API Documentation](https://pterodactyl.io/api/)

## Development

This project is under active development. Contributions are welcome!

## License

[MIT](LICENSE)
