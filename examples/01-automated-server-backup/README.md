# Automated Server Backup

## Overview

This workflow automatically backs up all servers in your Pterodactyl panel on a daily schedule. It runs at 3 AM every day, iterates through each server one at a time, creates a backup, waits for completion, and sends notifications about the backup status. This ensures you always have recent backups without manual intervention.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Pterodactyl Panel with API access
- Pterodactyl Client API credentials configured in n8n
- Webhook endpoint for notifications (Discord, Slack, or custom webhook)

## Setup Instructions

### 1. Import Workflow

1. Copy the contents of `workflow.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Paste the JSON content and import

### 2. Configure Credentials

1. Open the **List All Servers** node
2. Click on **Credential to connect with**
3. Select your existing Pterodactyl credentials or create new ones:
   - **Panel URL**: Your Pterodactyl panel URL (e.g., `https://panel.example.com`)
   - **API Key**: Your Client API key
4. Test the connection
5. The same credentials will be used for all Pterodactyl nodes

### 3. Customize Parameters

#### Schedule Timing
- Open the **Daily at 3 AM** node
- Adjust the hour/minute to your preferred backup time
- Default: 3:00 AM daily

#### Notification Webhooks
- Open **Send Success Notification** node
- Replace `https://your-webhook-url.com/backup-success` with your webhook URL
- Open **Send Failure Alert** node
- Replace `https://your-webhook-url.com/backup-failure` with your webhook URL

**Popular webhook options:**
- Discord: Create a webhook in Server Settings → Integrations
- Slack: Create an incoming webhook in your workspace
- Custom: Any HTTP endpoint that accepts POST requests

#### Wait Time (Optional)
- Default wait is 5 minutes for backup completion
- For large servers, increase in the **Wait 5 Minutes** node
- Recommended: 5-10 minutes depending on server size

### 4. Test & Activate

1. Click **Execute Workflow** to test manually
2. Verify backups are created in Pterodactyl panel
3. Check that notifications are received
4. Click **Active** toggle to enable automatic daily execution

## Usage

### Monitoring
- View execution history in n8n's **Executions** tab
- Check notification webhooks for success/failure messages
- Review backup list in Pterodactyl panel

### What the Workflow Does

1. **Triggers daily at 3 AM** (configurable)
2. **Fetches all servers** from your Pterodactyl panel
3. **Processes one server at a time** to avoid overloading the panel
4. **Creates a backup** for each server
5. **Waits 5 minutes** for backup to complete
6. **Checks backup status** to verify success
7. **Sends notification** (success or failure)
8. **Loops to next server** until all are backed up

## Customization Guide

### Adjust Backup Schedule

Change from daily to a different frequency:

```json
// For every 12 hours:
"rule": {
  "interval": [{"field": "hours", "hoursInterval": 12}]
}

// For weekly (Sundays at 3 AM):
"rule": {
  "interval": [{"field": "weeks", "weeksInterval": 1}]
},
"triggerTimes": {
  "item": [{"day": 0, "hour": 3, "minute": 0}]
}
```

### Filter Specific Servers

Add an IF node after "List All Servers" to backup only specific servers:

```json
{
  "conditions": {
    "string": [{
      "value1": "={{ $json.name }}",
      "operation": "contains",
      "value2": "production"
    }]
  }
}
```

### Batch Processing

To backup multiple servers simultaneously:
- Change **Process One Server at a Time** batch size from `1` to `3` (or desired number)
- **Warning**: Higher batch sizes may overload your panel

### Add Backup Retention Management

After the backup loop completes, add cleanup logic:
1. List all backups for each server
2. Keep only the N most recent backups
3. Delete older backups automatically

## Expected Behavior

### Successful Execution
- All servers will have a new backup created
- Notifications sent for each successful backup
- Execution time: ~6-7 minutes per server (5 min wait + processing)

### Notification Payload (Success)
```json
{
  "server": "My Game Server",
  "backup_id": "abc123-def456-ghi789",
  "status": "success",
  "timestamp": "2025-10-03T03:06:00.000Z"
}
```

### Notification Payload (Failure)
```json
{
  "server": "My Game Server",
  "backup_id": "abc123-def456-ghi789",
  "status": "failed",
  "timestamp": "2025-10-03T03:06:00.000Z"
}
```

## Troubleshooting

### Common Issues

**1. "Server not found" error**
- **Cause**: Invalid server identifier
- **Solution**: Verify the List Servers node is returning valid server data
- **Check**: The `identifier` field exists in server response

**2. "Permission denied" error**
- **Cause**: API key lacks backup creation permissions
- **Solution**: Ensure your Client API key has backup management permissions in Pterodactyl

**3. Backup not completing within 5 minutes**
- **Cause**: Large server data or slow storage
- **Solution**: Increase wait time in "Wait 5 Minutes" node to 10-15 minutes

**4. Webhook notifications not received**
- **Cause**: Invalid webhook URL or blocked requests
- **Solution**:
  - Test webhook URL with curl/Postman
  - Check n8n execution logs for HTTP errors
  - Verify webhook URL is publicly accessible

**5. Workflow processes some servers but times out**
- **Cause**: n8n execution timeout for long-running workflows
- **Solution**:
  - For many servers, consider splitting into multiple workflows
  - Or increase n8n's execution timeout settings

### Debugging Tips

1. **Test with one server first**: Modify the List Servers node to limit results
2. **Check execution data**: Click on each node after execution to see data flow
3. **Enable "Continue on Fail"**: In node settings, enable this to prevent workflow from stopping on errors
4. **Add error handling**: Insert additional IF nodes to catch and log specific error conditions

## Related Workflows

- **02-server-resource-monitoring**: Monitor server health and resources
- **06-health-check-auto-recovery**: Automated server recovery and health checks

## Performance Considerations

- **Large server count (50+)**: Consider splitting into multiple workflows by server group
- **Storage limitations**: Monitor panel disk space to avoid backup failures
- **Network bandwidth**: Backups may impact server performance during creation

## Security Notes

- Store webhook URLs as n8n credentials for better security
- Consider encrypting backup data at rest in Pterodactyl
- Regularly rotate API keys following security best practices
