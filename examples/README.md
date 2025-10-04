# n8n Pterodactyl Node - Example Workflows

Production-ready example workflows demonstrating practical use cases for the Pterodactyl n8n community node. Each workflow is a complete, importable JSON file with comprehensive documentation.

## 🚀 Quick Start

1. **Install the Pterodactyl node** in your n8n instance
2. **Configure Pterodactyl credentials** in n8n (Settings → Credentials)
3. **Import a workflow** from the examples below
4. **Customize parameters** for your environment
5. **Test and activate!**

## 📚 Available Workflows

| # | Workflow | Description | Difficulty | Use Case |
|---|----------|-------------|------------|----------|
| 01 | [Automated Server Backup](./01-automated-server-backup/) | Daily scheduled backups of all servers with completion verification | ⭐⭐ Intermediate | Backup automation, disaster recovery |
| 02 | [Server Resource Monitoring](./02-server-resource-monitoring/) | Monitor CPU/memory usage and alert on threshold breaches | ⭐ Beginner | Performance monitoring, alerting |
| 03 | [File Deployment Pipeline](./03-file-deployment-ci-cd/) | CI/CD integration for automated file deployment from Git | ⭐⭐⭐ Advanced | DevOps, configuration management |
| 04 | [Database Provisioning](./04-database-provisioning/) | Automated database creation with credential management | ⭐⭐ Intermediate | Server provisioning, automation |
| 05 | [User Onboarding](./05-user-onboarding/) | Complete customer onboarding with setup files and email | ⭐⭐⭐ Advanced | Customer automation, hosting providers |
| 06 | [Health Check Auto-Recovery](./06-health-check-auto-recovery/) | Monitor server health and auto-restart if unresponsive | ⭐⭐ Intermediate | High availability, self-healing |

## 📋 Prerequisites

### Required for All Workflows
- **n8n instance** (self-hosted v1.0+ or n8n Cloud)
- **Pterodactyl Panel** with API access enabled
- **Pterodactyl credentials** configured in n8n:
  - Panel URL (e.g., `https://panel.example.com`)
  - Client API key (from Pterodactyl account settings)

### Optional (Workflow-Specific)
- **Webhook endpoints** for notifications (Discord, Slack, custom)
- **Email service** for customer communications
- **Git repository** for CI/CD workflows
- **External monitoring tools** for advanced integrations

## 🎯 Workflow Categories

### Automation & Operations
- **01 - Automated Server Backup**: Scheduled backup automation
- **04 - Database Provisioning**: Resource provisioning automation
- **05 - User Onboarding**: Customer onboarding automation

### Monitoring & Alerts
- **02 - Server Resource Monitoring**: Proactive resource monitoring
- **06 - Health Check Auto-Recovery**: Self-healing infrastructure

### DevOps & CI/CD
- **03 - File Deployment Pipeline**: Git-based deployment automation

## 📖 How to Import a Workflow

### Method 1: Direct Import
1. Open the workflow directory (e.g., `01-automated-server-backup/`)
2. Copy the contents of `workflow.json`
3. In n8n, click **Workflows** → **Import from File**
4. Paste the JSON content
5. Click **Import**

### Method 2: File Upload
1. Download the `workflow.json` file
2. In n8n, click **Workflows** → **Import from File**
3. Click **Select file** and choose the downloaded JSON
4. Click **Import**

### After Import
1. **Configure credentials**: Select your Pterodactyl credentials in each Pterodactyl node
2. **Customize parameters**: Update server IDs, webhook URLs, schedules, etc.
3. **Test execution**: Click **Execute Workflow** to test
4. **Activate**: Toggle **Active** to enable automatic execution

## 🛠️ Configuration Guide

### Setting Up Pterodactyl Credentials

1. **In Pterodactyl Panel**:
   - Go to **Account** → **API Credentials**
   - Click **Create New** under "Account API"
   - Copy the generated API key

2. **In n8n**:
   - Go to **Settings** → **Credentials**
   - Click **Add Credential** → Search "Pterodactyl"
   - Enter your Panel URL and API key
   - Click **Save**

### Common Customizations

**Server ID**: Most workflows need a server identifier
```javascript
// Hardcode
"serverId": "my-minecraft-server"

// Environment variable (recommended)
"serverId": "={{ $env.SERVER_ID }}"
```

**Webhook URLs**: Replace placeholder URLs
```javascript
// Before
"url": "https://your-webhook-url.com/alerts"

// After (Discord example)
"url": "https://discord.com/api/webhooks/123/abc"
```

**Schedules**: Adjust trigger timing
```json
// Daily at 3 AM
{"field": "hours", "hoursInterval": 24}

// Every 5 minutes
{"field": "minutes", "minutesInterval": 5}
```

## 🎓 Learning Path

### Beginners Start Here
1. **02 - Server Resource Monitoring** (simplest, single server)
2. **01 - Automated Server Backup** (introduces loops)
3. **06 - Health Check Auto-Recovery** (adds conditional logic)

### Intermediate Users
1. **04 - Database Provisioning** (validation and error handling)
2. **03 - File Deployment Pipeline** (webhook triggers, CI/CD basics)

### Advanced Users
1. **05 - User Onboarding** (multi-step orchestration)
2. Combine multiple workflows into custom solutions

## 💡 Tips & Best Practices

### Testing
- **Always test manually first** before activating scheduled workflows
- **Use test servers** when possible to avoid impacting production
- **Check execution logs** in n8n's Executions tab
- **Verify webhook deliverability** before relying on alerts

### Production Deployment
- **Start with one workflow** and expand gradually
- **Monitor execution history** for the first week
- **Set up error notifications** to catch failures
- **Document customizations** for team members
- **Regular review** of workflow performance and logs

### Security
- **Use environment variables** for sensitive values (server IDs, API keys)
- **Validate webhook signatures** for external triggers
- **Limit API key permissions** to only what's needed
- **Rotate credentials** regularly per security policy
- **Use HTTPS** for all webhook endpoints

### Performance
- **Respect API rate limits** (Pterodactyl: ~240 requests/minute)
- **Batch operations** when processing multiple servers
- **Adjust check intervals** based on criticality
- **Monitor n8n resource usage** for heavy workflows

## 🔧 Troubleshooting

### Common Issues

**"Permission denied" errors**
- Verify API key has required permissions
- Check if using Client API (not Application API)

**Workflows not triggering**
- Ensure workflow is **Active** (toggle in top right)
- Verify schedule/webhook configuration
- Check n8n system logs

**Webhook not receiving data**
- Confirm n8n is publicly accessible
- Test webhook URL with curl
- Check firewall rules

**Credentials not working**
- Verify Panel URL (no trailing slash)
- Regenerate API key if expired
- Test with simple API call first

### Getting Help

1. **Check individual workflow README** for specific troubleshooting
2. **Review n8n execution logs** for detailed error messages
3. **Test Pterodactyl API** directly with curl/Postman
4. **Community support**:
   - [n8n Community Forum](https://community.n8n.io/)
   - [Pterodactyl Discord](https://discord.gg/pterodactyl)
   - [GitHub Issues](https://github.com/goevexx/pterodactyl-api-node/issues)

## 🤝 Contributing

Found a useful workflow pattern? Contributions are welcome!

### Contribution Guidelines

1. **Create a new workflow directory** following the naming convention
2. **Include both files**:
   - `workflow.json` - Importable n8n workflow
   - `README.md` - Comprehensive documentation
3. **Follow the template** (see `.workflow-template.md`)
4. **Test thoroughly** before submitting
5. **Submit a pull request** with clear description

### What Makes a Good Example?

- ✅ **Solves a real problem** (not just a tech demo)
- ✅ **Well-documented** (clear setup instructions)
- ✅ **Beginner-friendly** (or clearly marked as advanced)
- ✅ **Self-contained** (works after import with minimal config)
- ✅ **Best practices** (error handling, security considerations)

## 📊 Workflow Compatibility

| Workflow | n8n Version | Node Version | Pterodactyl Panel |
|----------|-------------|--------------|-------------------|
| All | 1.0+ | 1.0+ | v1.0+ |

**Note**: Workflows use standard n8n nodes and should be forward-compatible with future versions.

## 📝 License

These example workflows are provided as-is under the MIT License. Feel free to use, modify, and distribute them for your projects.

## 🔗 Related Resources

- [Pterodactyl Node Documentation](../README.md)
- [n8n Documentation](https://docs.n8n.io/)
- [Pterodactyl API Documentation](https://dashflo.net/docs/api/pterodactyl/v1/)
- [Community Forum](https://community.n8n.io/)

---

**Happy Automating! 🚀**

If these examples helped you, consider starring the repository and sharing with others in the n8n and Pterodactyl communities.
