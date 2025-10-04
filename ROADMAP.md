# Roadmap

This document outlines the planned development for the n8n Pterodactyl Node. This roadmap is subject to change based on community feedback and priorities.

## Current Status

✅ **v1.0.2 - Published & Available** (October 2025)

All essential Pterodactyl Panel operations are implemented and published:

- Server Management (5 operations)
- File Operations (8 operations)
- Database Management (4 operations)
- Backup Operations (6 operations)
- Account Management (6 operations)

**Total: 29 operations across 5 resources**

**Package Status:**
- ✅ Published on npm: [n8n-nodes-pterodactyl](https://www.npmjs.com/package/n8n-nodes-pterodactyl) v1.0.2
- ✅ Passes n8n security scanner
- ⚠️ n8n Community Nodes verification: **LOW PRIORITY** (requires demo video, package works perfectly on dedicated n8n)

## Completed Milestones

### ✅ Tier 1: Publication & Distribution

- ✅ Set up GitHub Actions CI/CD
  - Automated testing on pull requests
  - Automated npm publishing on releases
  - PR validation (Validate PR, Test, Claude Code workflows)
- ✅ Publish to npm registry (v1.0.0 Oct 2, v1.0.1 Oct 2, v1.0.2 Oct 3)
- ✅ Fix n8n verification blocker (removed setTimeout for rate limiting/retry)
- 🔄 Submit to n8n Community Nodes catalog - **On hold** (low priority, requires demo video)

## Next Up: Tier 2

### Documentation & Examples

**Goal:** Help users get started quickly and discover powerful use cases
**Priority:** ⭐⭐⭐⭐ HIGH
**Timeline:** Next milestone

- [ ] Create 6 example workflows
  - Automated server backups (daily schedule)
  - Server monitoring and alerts (resource thresholds)
  - Automated file deployment (CI/CD pipeline)
  - Database provisioning automation
  - User onboarding workflow
  - Health check with auto-recovery
- [ ] Workflow documentation for each example
- [ ] Usage guides and tutorials

## Future Milestones

### Tier 3: Testing & Quality (Month 1)

**Goal:** Ensure reliability and maintainability
**Priority:** ⭐⭐⭐ MEDIUM-HIGH
**Timeline:** ~Month 1 (November 2025)

- [ ] Unit tests for core functionality
  - Transport layer (API requests, error handling)
  - Credentials validation
  - Operation parameter validation
  - Target: 80%+ code coverage
- [ ] Integration tests with test Pterodactyl instance
  - End-to-end operation testing
  - Authentication flows
  - Error scenarios
- [ ] Automated test workflows in CI/CD
- [ ] Coverage reporting and badges

**Note:** Test tasks need updating since rate limiting/retry logic was removed in v1.0.2

### Tier 4: Advanced Features - User Management (Month 2-3)

**Priority:** ⭐⭐⭐ MEDIUM-HIGH
**Timeline:** Based on community demand

- [ ] Server-level subuser operations
  - List, create, get, update, delete subusers
  - Permission management system
  - Use case: Team access control, contractor permissions
- [ ] Panel-wide user management (Application API)
  - Full user CRUD operations
  - Use case: Hosting provider automation

### Tier 5: Advanced Features - Server Automation (Future)

**Priority:** ⭐⭐ MEDIUM
**Timeline:** Based on community demand

- [ ] Schedule management (cron tasks)
  - Create automated server tasks
  - Task chaining support
- [ ] Startup variable configuration
  - Dynamic server configuration
  - Environment variable management
- [ ] Network allocation management
  - Port and IP assignment
  - Multi-IP server configuration

### Tier 6: Administrative Operations (Future)

**Priority:** ⭐ LOW (Niche - hosting providers only)
**Timeline:** As requested by community

- [ ] Nest & Egg browsing (server types/configs)
- [ ] Location management (geographic organization)
- [ ] Node management (infrastructure)
- [ ] Full server CRUD (Application API)

## Version Planning

- ✅ **v1.0.0** (Oct 2, 2025) - Initial publication
- ✅ **v1.0.1** (Oct 2, 2025) - Repository URL fixes
- ✅ **v1.0.2** (Oct 3, 2025) - n8n verification fixes (removed setTimeout)
- 🔄 **v1.1.0** (Next) - Example workflows + enhanced documentation
- 📅 **v1.2.0** (Month 1) - Unit tests + Integration tests + Code quality
- 📅 **v1.3.0** (Month 2-3) - User management features (based on demand)
- 📅 **v2.0.0** (Quarter 2) - Advanced automation + Breaking changes (if any)

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

_Last updated: 2025-10-03_
_Current version: v1.0.2_
_Status: Published & Active Development_
