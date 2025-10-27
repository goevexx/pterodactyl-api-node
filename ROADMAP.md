# Roadmap

This document outlines the planned development for the n8n Pterodactyl Node. This roadmap is subject to change based on community feedback and priorities.

## Current Status

✅ **WebSocket & Enhanced Operations Complete**

All essential Pterodactyl Panel operations are implemented and tested:

**Client API (End-User Operations)**

- Server Management (5 operations)
- File Operations (8 operations)
- Database Management (4 operations)
- Backup Operations (6 operations)
- Account Management (6 operations)
- Schedule Management (6 operations)
- Subuser Management (4 operations)
- Network Management (2 operations)

**Application API (Admin Operations)**

- User Management (5 operations)
- Server Management (4 operations)
- Location Management (2 operations)

**WebSocket Real-Time Operations**

- WebSocket Trigger Node (real-time event streaming)
- WebSocket Command Node (server control, logs & stats, connection management)

**Total: 47 operations across 11 resources + 2 WebSocket nodes**

## Upcoming Milestones

### Publication & Distribution

**Goal:** Make the node easily accessible to the n8n community

- [x] Set up GitHub Actions CI/CD
  - Automated testing on pull requests
  - Automated npm publishing on releases
  - PR validation
- [x] Publish to npm registry
- [ ] Submit to n8n Community Nodes catalog

### Documentation & Examples

**Goal:** Help users get started quickly and discover powerful use cases

- [ ] Create example workflows
  - Automated server backups
  - Server monitoring and alerts
  - Automated file deployment
  - Database provisioning
  - User onboarding automation
  - Health check workflows
- [ ] Comprehensive usage documentation
- [ ] Video tutorials (community contributions welcome!)

### Testing & Quality

**Goal:** Ensure reliability and maintainability

- [x] Unit tests for core functionality (80%+ coverage)
- [x] Automated test workflows
- [ ] Integration tests with test Pterodactyl instance

### Advanced Features

**Completed**

- [x] Server-level subuser operations (permissions, invites)
- [x] Panel-wide user management (Application API)
- [x] Schedule management (cron tasks)
- [x] Network allocation management
- [x] Location management
- [x] Full server CRUD (Application API)
- [x] Real-time WebSocket event streaming
- [x] WebSocket command execution

**Future Enhancements (Based on Demand)**

- Startup variable configuration
- Nest & Egg browsing (server types/configs)
- Node management (infrastructure)
- Additional Application API resources

## Version Planning

- **v1.0.x** - Core Client API operations
- **v1.1.x** - WebSocket support, schedules, subusers, Application API operations (Current)
- **v1.2.x** - Documentation improvements, example workflows
- **v2.0.x** - Additional administrative operations and enhancements

## Contributing

Community feedback drives this roadmap! If you have:

- **Feature requests** - Open an issue describing your use case
- **Bug reports** - Help us improve reliability
- **Example workflows** - Share your creative automations
- **Documentation improvements** - PRs welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## Support

This is a community-maintained project. While we strive for quality, this node is provided as-is. For commercial support needs, please open a discussion.

---

_Last updated: 2025-10-27_
_Status: Active development_
