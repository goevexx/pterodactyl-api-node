# File Deployment Pipeline (CI/CD)

## Overview

This workflow creates an automated file deployment pipeline triggered by Git webhooks (GitHub, GitLab, Bitbucket). When you push configuration changes to your repository, this workflow automatically downloads the file, creates a safety backup, deploys it to your Pterodactyl server, reloads the server configuration, and sends deployment notifications. Perfect for managing game server configurations, plugin files, or any server files via Git.

## Prerequisites

- n8n instance (self-hosted or cloud) with publicly accessible webhook URL
- Pterodactyl Panel with API access
- Pterodactyl Client API credentials configured in n8n
- Git repository (GitHub, GitLab, or Bitbucket)
- Server identifier to deploy to
- Webhook endpoint for deployment notifications (optional)

## Setup Instructions

### 1. Import Workflow

1. Copy the contents of `workflow.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Paste the JSON content and import

### 2. Configure Credentials

1. Open any **Pterodactyl node** (e.g., "Create Safety Backup")
2. Select your Pterodactyl credentials
3. All Pterodactyl nodes will use the same credentials

### 3. Get Webhook URL

1. Click on the **Webhook Trigger** node
2. Copy the **Production URL** (e.g., `https://your-n8n.com/webhook/pterodactyl-deploy`)
3. Keep this URL for Git repository configuration

### 4. Configure Git Repository Webhook

#### GitHub
1. Go to your repository **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: Paste your n8n webhook URL
3. **Content type**: `application/json`
4. **Events**: Select "Just the push event"
5. Click **Add webhook**

#### GitLab
1. Go to **Settings** → **Webhooks**
2. **URL**: Paste your n8n webhook URL
3. **Trigger**: Check "Push events"
4. Click **Add webhook**

#### Bitbucket
1. Go to **Repository settings** → **Webhooks** → **Add webhook**
2. **URL**: Paste your n8n webhook URL
3. **Triggers**: Select "Repository push"
4. Click **Save**

### 5. Configure Webhook Payload

Your Git webhook or CI/CD pipeline should send a POST request with this JSON structure:

```json
{
  "server_id": "your-server-identifier",
  "file_url": "https://raw.githubusercontent.com/user/repo/main/server.properties",
  "file_path": "/config/server.properties",
  "reload_command": "reload",
  "commit_sha": "abc123def456",
  "commit_message": "Update spawn protection"
}
```

**Required fields:**
- `server_id`: Pterodactyl server identifier
- `file_url`: Direct download URL to the file

**Optional fields:**
- `file_path`: Target path on server (default: `/config/server.properties`)
- `reload_command`: Command to reload config (default: `reload`)
- `commit_sha`: Git commit hash (for tracking)
- `commit_message`: Commit message (for notifications)

### 6. GitHub Actions Example

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to Pterodactyl

on:
  push:
    branches: [main]
    paths:
      - 'server.properties'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger n8n Deployment
        run: |
          curl -X POST https://your-n8n.com/webhook/pterodactyl-deploy \
            -H "Content-Type: application/json" \
            -d '{
              "server_id": "${{ secrets.PTERODACTYL_SERVER_ID }}",
              "file_url": "https://raw.githubusercontent.com/${{ github.repository }}/${{ github.sha }}/server.properties",
              "file_path": "/config/server.properties",
              "reload_command": "reload",
              "commit_sha": "${{ github.sha }}",
              "commit_message": "${{ github.event.head_commit.message }}"
            }'
```

**Store secrets in GitHub:**
- Go to **Settings** → **Secrets** → **Actions**
- Add `PTERODACTYL_SERVER_ID` with your server identifier

### 7. Configure Deployment Notifications (Optional)

1. Open **Send Deployment Notification** node
2. Replace `https://your-webhook-url.com/deployment-success` with your webhook URL
3. Or remove this node if notifications aren't needed

### 8. Test the Workflow

1. Click **Execute Workflow** with test data
2. Or trigger a test push to your Git repository
3. Verify file is deployed and backup is created

## Usage

### How It Works

1. **Git push triggers webhook** → POST request sent to n8n
2. **Extract deployment info** → Parse webhook payload
3. **Download file** → Fetch file from repository URL
4. **Create safety backup** → Backup current server state
5. **Write file to server** → Deploy the new file
6. **Execute reload command** → Apply configuration changes
7. **Send notification** → Alert about deployment status
8. **Respond to webhook** → Return success response

### Webhook Payload Examples

#### Minimal Payload
```json
{
  "server_id": "my-minecraft-server",
  "file_url": "https://raw.githubusercontent.com/user/repo/main/config.yml"
}
```

#### Full Payload
```json
{
  "server_id": "production-game-server",
  "file_url": "https://raw.githubusercontent.com/org/configs/abc123/server.properties",
  "file_path": "/config/server.properties",
  "reload_command": "reload",
  "commit_sha": "abc123def456",
  "commit_message": "Increase max players to 100"
}
```

#### Multiple File Deployment
For deploying multiple files, call the webhook multiple times or modify the workflow to loop through a file array.

## Customization Guide

### Deploy Multiple Files

Add a loop to process multiple files in one deployment:

1. Modify payload to accept array:
```json
{
  "server_id": "my-server",
  "files": [
    {"url": "https://...", "path": "/config/server.properties"},
    {"url": "https://...", "path": "/plugins/config.yml"}
  ]
}
```

2. Add **Split In Batches** node after "Extract Deployment Info"
3. Loop through each file

### Add Rollback Capability

Store backup ID and create a rollback endpoint:

1. Save backup UUID to database or n8n static data
2. Create second webhook workflow for rollback
3. Restore from backup ID if deployment fails

### Environment-Based Deployment

Deploy to different servers based on branch:

```json
"server_id": "={{ $json.branch === 'production' ? 'prod-server' : 'dev-server' }}"
```

### Pre-Deployment Validation

Add validation before deployment:

1. Add **Code** node after "Download File"
2. Validate file syntax (JSON, YAML, properties)
3. Only proceed if valid

```javascript
// Example: Validate JSON
try {
  JSON.parse(items[0].json.data);
  return items;
} catch (error) {
  throw new Error('Invalid JSON file: ' + error.message);
}
```

### Post-Deployment Testing

Add health check after reload:

1. Wait 30 seconds
2. Check server resources
3. Send alert if server crashed

### Selective Deployment

Only deploy if specific files changed:

```javascript
// In GitHub Actions, check changed files
git diff-tree --no-commit-id --name-only -r ${{ github.sha }}
```

Only trigger webhook if specific files are in the changed list.

## Expected Behavior

### Successful Deployment

**Response:**
```json
{
  "success": true,
  "message": "Deployment completed successfully",
  "server_id": "my-server",
  "file_path": "/config/server.properties",
  "backup_id": "abc-123-def-456"
}
```

**Notification:**
```json
{
  "status": "success",
  "server_id": "my-server",
  "file_path": "/config/server.properties",
  "commit_sha": "abc123",
  "commit_message": "Update server config",
  "backup_id": "abc-123-def-456",
  "timestamp": "2025-10-03T16:00:00.000Z"
}
```

### Execution Time
- Typical: 10-15 seconds
- Includes backup creation, file write, and reload

## Troubleshooting

### Common Issues

**1. Webhook not triggering**
- **Cause**: n8n webhook URL not accessible
- **Solution**:
  - Verify n8n is publicly accessible
  - Check firewall/network settings
  - Test webhook URL with curl
  - Review Git webhook delivery logs

**2. "File not found" when downloading**
- **Cause**: Invalid file URL or authentication required
- **Solution**:
  - Verify file URL is direct download link
  - For private repos, add authentication to HTTP Request node
  - Test URL in browser

**3. "Permission denied" when writing file**
- **Cause**: API key lacks file management permissions
- **Solution**: Verify Pterodactyl credentials have file write access

**4. Reload command not executing**
- **Cause**: Invalid command or server not running
- **Solution**:
  - Verify server is in "running" state
  - Test command manually in server console
  - Check server supports the reload command

**5. Backup creation fails**
- **Cause**: Storage quota exceeded or backup limit reached
- **Solution**:
  - Check Pterodactyl panel storage space
  - Delete old backups
  - Increase backup quota

### Debugging Tips

1. **Test with curl**: Manually trigger webhook to isolate Git integration issues
```bash
curl -X POST https://your-n8n.com/webhook/pterodactyl-deploy \
  -H "Content-Type: application/json" \
  -d '{"server_id":"test","file_url":"https://..."}'
```

2. **Check execution logs**: Review n8n execution history for errors

3. **Verify file content**: Click "Download File" node to inspect downloaded content

4. **Test each step**: Execute workflow manually and verify each node's output

### Security Considerations

**Private Repositories**

For private Git repositories, add authentication:

1. **GitHub**: Use Personal Access Token
```json
"headers": {
  "Authorization": "token YOUR_GITHUB_TOKEN"
}
```

2. **GitLab**: Use Private Token
```json
"headers": {
  "PRIVATE-TOKEN": "YOUR_GITLAB_TOKEN"
}
```

**Webhook Security**

Add webhook signature validation:

1. Configure webhook secret in Git provider
2. Add **Code** node to verify HMAC signature
3. Reject invalid requests

```javascript
// Example: GitHub webhook validation
const crypto = require('crypto');
const signature = $input.item.headers['x-hub-signature-256'];
const payload = JSON.stringify($input.item.body);
const secret = 'your-webhook-secret';

const hmac = crypto.createHmac('sha256', secret);
const digest = 'sha256=' + hmac.update(payload).digest('hex');

if (signature !== digest) {
  throw new Error('Invalid webhook signature');
}
return items;
```

## Performance Considerations

- **File size limits**: Keep deployed files under 10MB for best performance
- **Backup creation**: Adds 5-10 seconds to deployment time
- **Concurrent deployments**: Workflow handles one deployment at a time per server
- **Rate limiting**: Respects Pterodactyl API rate limits

## Related Workflows

- **01-automated-server-backup**: Scheduled backup automation
- **05-user-onboarding**: Multi-step server provisioning

## Extension Ideas

1. **Blue-green deployment**: Deploy to staging first, then production
2. **Automated testing**: Run tests after deployment before reload
3. **Slack/Discord notifications**: Rich deployment status messages
4. **Deployment history**: Store deployment records in database
5. **Rollback automation**: Auto-rollback if server crashes after deployment
6. **Multi-server deployment**: Deploy same file to multiple servers
