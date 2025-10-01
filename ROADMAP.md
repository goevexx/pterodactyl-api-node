# Roadmap

This document outlines the planned development for the n8n Pterodactyl Node. This roadmap is subject to change based on community feedback and priorities.

## Current Status

✅ **v1.0.0 - Core Functionality Complete**

All essential Pterodactyl Panel operations are implemented and tested:
- Server Management (5 operations)
- File Operations (8 operations)
- Database Management (4 operations)
- Backup Operations (6 operations)
- Account Management (6 operations)

**Total: 29 operations across 5 resources**

## Upcoming Milestones

### Publication & Distribution

**Goal:** Make the node easily accessible to the n8n community

- [ ] Set up GitHub Actions CI/CD
  - Automated testing on pull requests
  - Automated npm publishing on releases
  - PR validation
- [ ] Publish to npm registry
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

- [ ] Unit tests for core functionality (80%+ coverage)
- [ ] Integration tests with test Pterodactyl instance
- [ ] Automated test workflows

### Advanced Features (Based on Demand)

**User Management**
- Server-level subuser operations (permissions, invites)
- Panel-wide user management (Application API)

**Server Automation**
- Schedule management (cron tasks)
- Startup variable configuration
- Network allocation management

**Administrative Operations**
- Nest & Egg browsing (server types/configs)
- Location management
- Node management (infrastructure)
- Full server CRUD (Application API)

## Version Planning

- **v1.0.x** - Bug fixes and documentation improvements
- **v1.1.x** - User management features
- **v1.2.x** - Advanced automation (schedules, startup vars)
- **v2.0.x** - Administrative operations (Application API focus)

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

*Last updated: 2025-10-01*
*Status: Active development*
