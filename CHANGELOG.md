# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-01

### Added

- Initial release of n8n-nodes-pterodactyl
- Support for Pterodactyl Client API and Application API authentication
- Server management operations (5 operations)
  - List Servers
  - Get Server
  - Power Action (start, stop, restart, kill)
  - Send Command
  - Get Resources
- File operations (8 operations)
  - List Files
  - Read File
  - Write File
  - Delete File
  - Compress Files
  - Decompress File
  - Create Folder
  - Get Upload URL
- Database management (4 operations)
  - List Databases
  - Create Database
  - Rotate Password
  - Delete Database
- Backup operations (6 operations)
  - List Backups
  - Create Backup
  - Get Backup
  - Download Backup
  - Restore Backup
  - Delete Backup
- Account operations (6 operations)
  - Get Account
  - Update Email
  - Update Password
  - List API Keys
  - Create API Key
  - Delete API Key
- Rate limiting with automatic retry
- Pagination support for list operations
- Comprehensive error handling

### Documentation

- README with installation and usage instructions
- API credential setup guide
- Operation descriptions
- Usage examples

[1.0.0]: https://github.com/nico-on-github/pterodactyl-api-node/releases/tag/v1.0.0
