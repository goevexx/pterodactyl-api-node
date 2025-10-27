# n8n-nodes-pterodactyl

[![npm version](https://img.shields.io/npm/v/n8n-nodes-pterodactyl.svg)](https://www.npmjs.com/package/n8n-nodes-pterodactyl)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-pterodactyl.svg)](https://www.npmjs.com/package/n8n-nodes-pterodactyl)
[![codecov](https://codecov.io/gh/goevexx/pterodactyl-api-node/branch/main/graph/badge.svg)](https://codecov.io/gh/goevexx/pterodactyl-api-node)
[![Tests](https://github.com/goevexx/pterodactyl-api-node/actions/workflows/test.yml/badge.svg)](https://github.com/goevexx/pterodactyl-api-node/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Automate your Pterodactyl Panel with n8n workflows - manage game servers, monitor resources in real-time, and control infrastructure via API.

[Pterodactyl Panel](https://pterodactyl.io/) is an open-source game server management platform built with PHP, React, and Go.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Via n8n Community Nodes](#via-n8n-community-nodes)
  - [Manual Installation (Self-Hosted)](#manual-installation-self-hosted)
- [Quick Start](#quick-start)
- [What You Can Do](#what-you-can-do)
  - [Client API Operations](#client-api-operations)
  - [Application API Operations (Admin)](#application-api-operations-admin)
  - [WebSocket Features](#websocket-features)
- [Usage Examples](#usage-examples)
  - [Automated Backups](#automated-backups)
  - [Real-Time Monitoring](#real-time-monitoring)
  - [Config Deployment](#config-deployment)
  - [Server Provisioning](#server-provisioning)
- [Credentials Setup](#credentials-setup)
  - [Client API Key](#client-api-key)
  - [Application API Key](#application-api-key)
- [Troubleshooting](#troubleshooting)
- [Compatibility](#compatibility)
- [Advanced Features](#advanced-features)
- [Contributing](#contributing)
- [Project Status](#project-status)
- [License](#license)
- [Important Notice](#important-notice)
- [Resources](#resources)

---

## Features

- 🎮 **47+ Operations** - Server management, files, databases, backups, users, schedules, networks
- ⚡ **Real-Time WebSocket** - Stream console output and resource statistics
- 👥 **Client & Application APIs** - Both user and admin operations
- 🔐 **Credential Validation** - Tests API connectivity on credential save
- 🎨 **Dynamic Dropdowns** - Load servers, users, and locations from your panel
- 📦 **TypeScript** - Full type definitions included

---

## Installation

### Via n8n Community Nodes

1. In n8n, go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-pterodactyl`
4. Click **Install**

### Manual Installation (Self-Hosted)

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-pterodactyl
```

Restart n8n to load the new nodes.

---

## Quick Start

### 1. Set Up Credentials

You'll need an API key from your Pterodactyl Panel:

**For Client API (user operations):**
- Go to Account Settings → API Credentials
- Create a new API key
- Copy the key immediately

**For Application API (admin operations):**
- Go to Admin Panel → Application API
- Create a new API key with appropriate permissions
- Copy the key immediately

### 2. Configure in n8n

1. Add a Pterodactyl node to your workflow
2. Click **Create New Credential**
3. Select the credential type you need
4. Enter your Panel URL and API key
5. Save and test the connection

### 3. Start Automating

Create a workflow to list your servers and check their status.

---

## What You Can Do

### Client API Operations

**Server Management**
- List all your servers
- Get server details and resource usage
- Control server power (start, stop, restart)
- Send console commands
- Monitor real-time resource usage

**File Operations**
- Browse and manage server files
- Read and write file contents
- Create archives and extract files
- Get secure upload URLs

**Database Management**
- List and create databases
- Rotate passwords
- Delete databases when needed

**Backup Operations**
- Create and restore backups
- Download backup archives
- Manage backup retention

**Account & Access**
- Manage your account settings
- Control API keys
- Manage subuser permissions
- Configure server schedules

**Network**
- View and manage IP allocations
- Set primary allocation

### Application API Operations (Admin)

**User Management**
- Create and manage user accounts
- View user details and their servers

**Server Provisioning**
- Create new game servers
- Update server configurations
- Remove servers

**Infrastructure**
- Manage datacenter locations

### WebSocket Features

**Real-Time Monitoring**
- Stream console output
- Get live resource statistics
- React to server status changes
- Track installation progress

**Connection Management**
- Automatic reconnection on disconnect
- Token refresh handling
- Graceful error recovery

---

## Usage Examples

### Automated Backups

Schedule daily backups for all servers:

```
Schedule Trigger (Daily at 3 AM)
  ↓
List Servers
  ↓
For each server
  ↓
  Create Backup
  ↓
  Send notification to Slack/Discord
```

### Real-Time Monitoring

Alert on server errors from console output:

```
WebSocket Trigger
  ↓
Listen for console output
  ↓
If error detected
  ↓
  Send alert to team
```

### Config Deployment

Deploy configuration updates automatically:

```
GitHub Webhook (on push)
  ↓
Download config file
  ↓
Write to server
  ↓
Restart server
  ↓
Confirm success
```

### Server Provisioning

Automate customer onboarding:

```
Webhook (new order)
  ↓
Create user account
  ↓
Create server
  ↓
Send welcome email
```

---

## Credentials Setup

### Client API Key

Use for: Server management, file operations, backups

1. Log into your Pterodactyl Panel
2. Click your username → **Account Settings**
3. Go to **API Credentials**
4. Click **Create New**
5. Add a description (e.g., "n8n Automation")
6. Copy the key (shown only once!)

### Application API Key

Use for: User management, server creation, admin tasks

1. Log into Pterodactyl as admin
2. Go to **Admin Panel**
3. Navigate to **Application API**
4. Click **Create New**
5. Add description and select permissions
6. Copy the key (shown only once!)

**Tips:**
- Use Client API for most automation tasks
- Only use Application API when you need admin privileges
- Create separate keys for different workflows
- Never share API keys or commit them to code

---

## Troubleshooting

### Common Issues

**Can't connect to Panel**
- Check that your Panel URL is correct (e.g., `https://panel.example.com`)
- Remove any trailing slashes from the URL
- Verify the panel is accessible from your n8n instance

**API Key not working**
- Make sure you copied the entire key
- Check if the key was revoked in the panel
- Verify you're using the right credential type (Client vs Application)

**WebSocket won't connect**
- Ensure Wings is running on the server
- Check firewall rules allow WebSocket connections
- Verify the server ID is correct

**"ConfigurationNotPersistedException" warning**
- This is usually harmless - it means Wings couldn't sync immediately
- The operation succeeded on the Panel
- Wings will sync when it comes back online

### Getting Help

- 📖 [GitHub Repository](https://github.com/goevexx/pterodactyl-api-node)
- 🐛 [Report an Issue](https://github.com/goevexx/pterodactyl-api-node/issues)
- 💬 [n8n Community Forum](https://community.n8n.io/)
- 📧 [Email](mailto:contact@morawietz.dev)

---

## Compatibility

**Requirements:**
- n8n v0.198.0 or higher
- Pterodactyl Panel v1.0 or higher
- Wings v1.0 or higher (for WebSocket features)
- Node.js v18.10.0 or higher

**Tested with:**
- n8n 1.x
- Pterodactyl Panel 1.11.x
- Self-hosted and n8n Cloud
- PostgreSQL and MySQL

---

## Advanced Features

### Dynamic Dropdowns

Many operations include dropdowns that load data from your panel:
- Server selection shows your accessible servers
- User selection (Application API)
- Location selection
- Allocation management

### Pagination

List operations handle pagination automatically:
- Enable "Return All" to fetch everything
- Or set a limit for faster queries

### Error Handling

Error handling features:
- Retries on HTTP 429 (rate limit) and 5xx responses
- ConfigurationNotPersistedException logged as warning instead of error
- WebSocket reconnection with exponential backoff

---

## Contributing

This is a community project and we welcome contributions!

### How to Help

- 🐛 Report bugs or issues you encounter
- 💡 Suggest features or improvements
- 📝 Improve documentation
- 🧪 Add test coverage
- 💻 Submit pull requests

### Development Setup

```bash
# Clone the repository
git clone https://github.com/goevexx/pterodactyl-api-node.git
cd pterodactyl-api-node

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Project Status

This project is actively maintained. Current focus:

- ✅ Core operations implemented and tested
- ✅ WebSocket support with auto-reconnect
- ✅ 81% test coverage
- 🔄 Adding more example workflows
- 🔄 Improving documentation
- 📋 Planning additional Pterodactyl features

See [ROADMAP.md](ROADMAP.md) for detailed plans.

---

## License

[MIT](LICENSE) - Free to use, modify, and distribute.

---

## Acknowledgments

- Built for the [n8n](https://n8n.io/) community
- Integrates with [Pterodactyl Panel](https://pterodactyl.io/)
- Thanks to all contributors and users

---

## Important Notice

> **⚠️ Independent Project**
>
> This project is independently maintained and not officially affiliated with Pterodactyl Panel or n8n.
>
> Pterodactyl® is a registered trademark of Dane Everitt and contributors. The Pterodactyl logo is used under nominative fair use to indicate compatibility with the Pterodactyl Panel API.

---

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [Pterodactyl Panel](https://pterodactyl.io/)
- [Pterodactyl API Docs](https://pterodactyl-api-docs.netvpx.com/)

---

<div align="center">

**Built with ❤️ for the community**

[Documentation](https://github.com/goevexx/pterodactyl-api-node) · [Issues](https://github.com/goevexx/pterodactyl-api-node/issues) · [Discussions](https://github.com/goevexx/pterodactyl-api-node/discussions)

</div>
