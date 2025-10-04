# Server Resource Monitoring

## Overview

This workflow continuously monitors a Pterodactyl server's resource usage (CPU, memory, disk) every 5 minutes. When resource usage exceeds configured thresholds (CPU > 80% or Memory > 90%), it sends an alert to your notification endpoint. This enables proactive monitoring and helps prevent server crashes due to resource exhaustion.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Pterodactyl Panel with API access
- Pterodactyl Client API credentials configured in n8n
- Server identifier (ID) to monitor
- Webhook endpoint for alerts (Discord, Slack, monitoring dashboard, etc.)

## Setup Instructions

### 1. Import Workflow

1. Copy the contents of `workflow.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Paste the JSON content and import

### 2. Configure Credentials

1. Open the **Get Server Details** node
2. Select your Pterodactyl credentials
3. The same credentials will be used for the **Get Server Resources** node

### 3. Set Server ID

You have two options for specifying the server to monitor:

#### Option A: Environment Variable (Recommended)
1. In n8n, go to **Settings** → **Environment Variables**
2. Add variable: `SERVER_ID` with your server identifier
3. The workflow will automatically use this value

#### Option B: Hardcode in Workflow
1. Open the **Get Server Details** node
2. Replace `={{ $env.SERVER_ID || 'your-server-id' }}` with your actual server ID
3. Example: `my-minecraft-server`

### 4. Configure Alert Webhook

1. Open the **Send Alert** node
2. Replace `https://your-webhook-url.com/alerts` with your webhook URL

**Example webhook URLs:**
- **Discord**: `https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN`
- **Slack**: Your incoming webhook URL
- **Custom dashboard**: Your monitoring API endpoint

### 5. Customize Thresholds (Optional)

Open the **High Resource Usage?** node to adjust alert thresholds:

- **CPU threshold**: Default is 80%
- **Memory threshold**: Default is 90%

### 6. Test & Activate

1. Click **Execute Workflow** to test
2. Verify alerts are sent when thresholds are breached
3. Activate the workflow to start continuous monitoring

## Usage

### What the Workflow Does

1. **Runs every 5 minutes** automatically
2. **Fetches server details** (name, identifier)
3. **Gets current resource usage** (CPU, memory, disk, state)
4. **Extracts and calculates metrics**:
   - CPU usage percentage
   - Memory usage in MB and percentage
   - Disk usage in MB
   - Server state (running, offline, etc.)
5. **Checks thresholds**: If CPU > 80% OR Memory > 90%
6. **Sends alert** if thresholds exceeded
7. **Logs healthy status** if within normal range

### Monitoring Multiple Servers

To monitor multiple servers, you can:

**Option 1: Duplicate the workflow**
- Import this workflow multiple times
- Configure each with a different `SERVER_ID`

**Option 2: Modify to loop through servers**
- Add a "List Servers" node at the start
- Use "Split In Batches" to iterate through all servers
- See Example 1 (Automated Server Backup) for loop pattern

## Customization Guide

### Adjust Monitoring Frequency

Change from every 5 minutes to different interval:

```json
// Every 1 minute (for critical servers):
"rule": {
  "interval": [{"field": "minutes", "minutesInterval": 1}]
}

// Every 15 minutes (for less critical servers):
"rule": {
  "interval": [{"field": "minutes", "minutesInterval": 15}]
}
```

### Modify Alert Thresholds

In the **High Resource Usage?** node, adjust the conditions:

```json
// More aggressive thresholds:
{
  "leftValue": "={{ $json.cpu_usage }}",
  "rightValue": 90,  // Changed from 80
  "operator": {"type": "number", "operation": "gt"}
}

// Add disk usage threshold:
{
  "leftValue": "={{ $json.disk_usage_mb }}",
  "rightValue": 10000,  // 10GB
  "operator": {"type": "number", "operation": "gt"}
}
```

### Change Alert Logic (AND vs OR)

Currently alerts if CPU > 80% **OR** Memory > 90%. To require both:

```json
"combinator": "and"  // Changed from "or"
```

### Add Severity Levels

The alert already includes severity calculation:
- **Warning**: CPU > 80% or Memory > 90%
- **Critical**: CPU > 90% or Memory > 95%

Customize in the **Send Alert** node's `severity` field.

### Integration with Monitoring Tools

#### Discord Webhook Format
```json
{
  "content": "🚨 **High Resource Usage Alert**",
  "embeds": [{
    "title": "{{ $json.server_name }}",
    "color": 15158332,
    "fields": [
      {"name": "CPU Usage", "value": "{{ $json.cpu_usage }}%", "inline": true},
      {"name": "Memory", "value": "{{ $json.memory_percent.toFixed(2) }}%", "inline": true}
    ],
    "timestamp": "{{ $now.toISO() }}"
  }]
}
```

#### Slack Webhook Format
```json
{
  "text": "🚨 High Resource Usage Alert",
  "blocks": [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Server:* {{ $json.server_name }}\n*CPU:* {{ $json.cpu_usage }}%\n*Memory:* {{ $json.memory_percent.toFixed(2) }}%"
    }
  }]
}
```

## Expected Behavior

### Normal Execution (Healthy Server)
- Workflow runs every 5 minutes
- Checks resources
- Logs healthy status (no alert sent)
- Continues monitoring

### Alert Triggered
When CPU > 80% OR Memory > 90%:

**Alert Payload:**
```json
{
  "alert_type": "high_resource_usage",
  "server": "My Game Server",
  "cpu_usage": 85.5,
  "memory_usage_percent": 92.34,
  "memory_usage_mb": 7387,
  "memory_limit_mb": 8000,
  "disk_usage_mb": 4523,
  "server_state": "running",
  "timestamp": "2025-10-03T15:30:00.000Z",
  "severity": "warning"
}
```

## Troubleshooting

### Common Issues

**1. "Server not found" error**
- **Cause**: Invalid server ID
- **Solution**:
  - Verify server ID is correct (check Pterodactyl panel URL)
  - Ensure you're using the server identifier, not the UUID
  - Test by manually running "Get Server Details" node

**2. "Permission denied" error**
- **Cause**: API key lacks resource monitoring permissions
- **Solution**: Verify Client API key has server resource access

**3. Alerts not being sent**
- **Cause**: Webhook URL invalid or unreachable
- **Solution**:
  - Test webhook URL with curl or Postman
  - Check n8n execution logs for HTTP errors
  - Verify webhook accepts POST requests

**4. Wrong resource values**
- **Cause**: Calculation errors in expressions
- **Solution**:
  - Click on "Extract Metrics" node after execution
  - Verify calculated values are correct
  - Check raw API response in "Get Server Resources" node

**5. Too many alerts (alert fatigue)**
- **Cause**: Thresholds too low or check frequency too high
- **Solution**:
  - Increase threshold values (e.g., 90% instead of 80%)
  - Add cooldown period (only alert once per hour for same issue)
  - Implement alert deduplication logic

### Debugging Tips

1. **Check raw resource data**: After execution, click "Get Server Resources" node to see raw API response
2. **Verify calculations**: Click "Extract Metrics" to see computed values
3. **Test threshold logic**: Manually adjust threshold values to trigger alerts
4. **Enable execution logging**: In workflow settings, save execution data for debugging

### Advanced: Alert Cooldown

To prevent alert spam, add a cooldown mechanism:

1. Add **Code** node after "High Resource Usage?" (true branch)
2. Use n8n's static data to track last alert time
3. Only send alert if > 30 minutes since last alert

```javascript
// Check if we've alerted recently
const lastAlertTime = this.getWorkflowStaticData('global').lastAlertTime || 0;
const now = Date.now();
const cooldownMinutes = 30;

if (now - lastAlertTime > cooldownMinutes * 60 * 1000) {
  // Update last alert time
  this.getWorkflowStaticData('global').lastAlertTime = now;
  return items; // Send alert
}

return []; // Skip alert (still in cooldown)
```

## Performance Considerations

- **API rate limits**: 5-minute intervals stay well within Pterodactyl rate limits
- **Execution time**: ~1-2 seconds per check
- **Resource overhead**: Minimal impact on panel or n8n
- **Multiple servers**: For 10+ servers, consider increasing interval to 10 minutes

## Related Workflows

- **06-health-check-auto-recovery**: Automatic server restart when issues detected
- **01-automated-server-backup**: Scheduled backup automation

## Extension Ideas

1. **Historical tracking**: Store metrics in a database for trend analysis
2. **Grafana integration**: Send metrics to Grafana for visualization
3. **Auto-scaling**: Trigger server resource upgrades when consistently high
4. **Predictive alerts**: Alert when usage is trending toward limits
5. **Multi-server dashboard**: Aggregate metrics from all servers
