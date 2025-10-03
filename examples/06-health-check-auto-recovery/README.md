# Health Check with Auto-Recovery

## Overview

This workflow continuously monitors a Pterodactyl server's health and automatically attempts recovery if the server becomes unresponsive. Running every 10 minutes, it checks the server state, attempts an automatic restart if the server is down, waits for recovery, and sends appropriate notifications based on the outcome. This provides self-healing infrastructure that minimizes downtime and reduces manual intervention.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Pterodactyl Panel with API access
- Pterodactyl Client API credentials configured in n8n
- Server identifier to monitor
- Webhook endpoints for notifications (Discord, Slack, PagerDuty, etc.)

## Setup Instructions

### 1. Import Workflow

1. Copy the contents of `workflow.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Paste the JSON content and import

### 2. Configure Credentials

1. Open any **Pterodactyl node** (e.g., "Check Server Status")
2. Select your Pterodactyl credentials
3. All Pterodactyl nodes will use the same credentials

### 3. Set Server ID

Choose one of two options:

#### Option A: Environment Variable (Recommended)
1. In n8n, go to **Settings** → **Environment Variables**
2. Add: `SERVER_ID` = `your-server-identifier`
3. Workflow will automatically use this value

#### Option B: Hardcode in Workflow
1. Open each Pterodactyl node
2. Replace `={{ $env.SERVER_ID || 'your-server-id' }}` with actual server ID
3. Update all 3 Pterodactyl nodes

### 4. Configure Notification Webhooks

1. Open **Send Recovery Notification** node
2. Replace `https://your-webhook-url.com/server-recovered`
3. Open **Send Critical Alert** node
4. Replace `https://your-webhook-url.com/server-critical`

### 5. Customize Wait Time (Optional)

Default is 2 minutes wait after restart:
- Open **Wait for Restart** node
- Adjust `amount` field (recommended: 2-5 minutes)
- Longer for large servers, shorter for lightweight services

### 6. Test & Activate

1. **Test manually**: Click **Execute Workflow**
2. **Verify behavior**: Check server state is detected correctly
3. **Activate**: Toggle **Active** to enable automatic monitoring

## Usage

### How It Works

**Normal Operation (Server Running):**
1. Check server status every 10 minutes
2. Verify state is "running"
3. Log healthy status
4. Continue monitoring

**Recovery Scenario (Server Down):**
1. Detect server is not in "running" state
2. Send restart command to server
3. Wait 2 minutes for restart
4. Check server status again
5. **If recovered**: Send recovery notification
6. **If still down**: Send critical alert

### Server States

- `running`: Server is healthy and responsive
- `offline`: Server is stopped (triggers recovery)
- `starting`: Server is booting up
- `stopping`: Server is shutting down

### Monitored Scenarios

✅ **Will trigger recovery:**
- Server state: `offline`
- Server state: `stopping` (stuck shutting down)
- Server crashed

❌ **Won't trigger recovery:**
- Server state: `running` (healthy)
- Server state: `starting` (already recovering)

## Customization Guide

### Adjust Check Frequency

Change from every 10 minutes:

```json
// Every 5 minutes (more aggressive):
"rule": {
  "interval": [{"field": "minutes", "minutesInterval": 5}]
}

// Every 30 minutes (less aggressive):
"rule": {
  "interval": [{"field": "minutes", "minutesInterval": 30}]
}
```

**Recommendation**: 5-10 minutes for production, 15-30 minutes for development

### Multiple Recovery Attempts

Add retry logic with exponential backoff:

1. After first restart fails, wait 5 minutes
2. Attempt second restart
3. If still fails, send critical alert

```
Restart → Wait 2min → Check → Failed → Wait 5min → Restart → Wait 2min → Check → Alert
```

### Health Check Criteria

Add additional health checks beyond just "running" state:

```json
// Check CPU usage is reasonable
{
  "leftValue": "={{ $json.resources.cpu_absolute }}",
  "rightValue": 100,
  "operator": {"type": "number", "operation": "smaller"}
}

// Check memory usage is not maxed
{
  "leftValue": "={{ $json.resources.memory_bytes }}",
  "rightValue": "={{ $json.resources.memory_limit_bytes }}",
  "operator": {"type": "number", "operation": "smaller"}
}
```

### Different Recovery Actions

Instead of restart, try different power actions:

- `start`: If server is completely offline
- `stop` then `start`: Full power cycle
- `kill`: Force stop and restart (dangerous)

### Notification Integrations

#### Discord Webhook
```json
{
  "content": "🔴 **Critical Alert**",
  "embeds": [{
    "title": "Server Down - Manual Intervention Required",
    "description": "Server {{ $env.SERVER_ID }} failed to recover after automatic restart",
    "color": 15158332,
    "fields": [
      {"name": "Initial State", "value": "{{ $node['Check Server Status'].json.current_state }}", "inline": true},
      {"name": "State After Restart", "value": "{{ $json.current_state }}", "inline": true},
      {"name": "Time", "value": "{{ $now.toFormat('HH:mm:ss') }}", "inline": true}
    ],
    "timestamp": "{{ $now.toISO() }}"
  }]
}
```

#### Slack Webhook
```json
{
  "text": "🟢 Server Recovered",
  "blocks": [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Server {{ $env.SERVER_ID }}* automatically recovered after restart"
    }
  }, {
    "type": "section",
    "fields": [
      {"type": "mrkdwn", "text": "*Previous State:*\n{{ $node['Check Server Status'].json.current_state }}"},
      {"type": "mrkdwn", "text": "*Current State:*\n{{ $json.current_state }}"}
    ]
  }]
}
```

#### PagerDuty Integration
```json
{
  "routing_key": "YOUR_INTEGRATION_KEY",
  "event_action": "trigger",
  "payload": {
    "summary": "Server {{ $env.SERVER_ID }} failed auto-recovery",
    "severity": "critical",
    "source": "n8n-health-check",
    "custom_details": {
      "initial_state": "{{ $node['Check Server Status'].json.current_state }}",
      "state_after_restart": "{{ $json.current_state }}"
    }
  }
}
```

### Monitor Multiple Servers

**Option 1: Duplicate Workflow**
- Import workflow multiple times
- Configure each with different `SERVER_ID`

**Option 2: Loop Through Servers**
1. Add "List Servers" node at start
2. Use "Split In Batches" to iterate
3. Check each server's health
4. See Example 1 (Automated Backup) for loop pattern

### Add Uptime Tracking

Store uptime metrics:

1. Add database connection (PostgreSQL, MySQL, etc.)
2. After "Log Healthy Status", insert record:
```sql
INSERT INTO server_uptime (server_id, check_time, status, state)
VALUES ('{{ $env.SERVER_ID }}', NOW(), 'healthy', '{{ $json.current_state }}');
```

3. Track downtime incidents similarly

### Escalation Logic

Escalate if server frequently down:

1. Count recovery attempts in past 24 hours
2. If > 5 attempts, escalate to on-call engineer
3. Disable auto-recovery to prevent restart loops

## Expected Behavior

### Normal Health Check

**Server Running:**
```json
{
  "timestamp": "2025-10-03T16:00:00.000Z",
  "status": "healthy",
  "state": "running",
  "cpu": 45.2,
  "memory_mb": 2048,
  "uptime": 86400
}
```

**Workflow**: Completes in ~2 seconds, no alerts sent

### Auto-Recovery Scenario

**Server Down → Restart → Recovery:**

1. **T+0s**: Detect server offline
2. **T+1s**: Send restart command
3. **T+120s**: Wait completes
4. **T+121s**: Check status - server running
5. **T+122s**: Send recovery notification

**Recovery Notification:**
```json
{
  "alert_type": "server_recovered",
  "severity": "info",
  "server_id": "my-minecraft-server",
  "message": "Server automatically restarted and recovered successfully",
  "previous_state": "offline",
  "current_state": "running",
  "downtime_minutes": 2,
  "timestamp": "2025-10-03T16:02:00.000Z"
}
```

### Failed Recovery

**Server Down → Restart → Still Down:**

1. **T+0s**: Detect server offline
2. **T+1s**: Send restart command
3. **T+120s**: Wait completes
4. **T+121s**: Check status - still offline
5. **T+122s**: Send critical alert

**Critical Alert:**
```json
{
  "alert_type": "server_down",
  "severity": "critical",
  "server_id": "my-minecraft-server",
  "message": "Server failed to recover after automatic restart - manual intervention required",
  "initial_state": "offline",
  "state_after_restart": "offline",
  "restart_attempted": true,
  "timestamp": "2025-10-03T16:02:00.000Z"
}
```

## Troubleshooting

### Common Issues

**1. Server keeps restarting in a loop**
- **Cause**: Server crashes immediately after restart
- **Solution**:
  - Check server logs for crash reason
  - Disable auto-recovery temporarily
  - Fix underlying issue (memory, disk, config error)
  - Add cooldown period between restart attempts

**2. False positives (restarts healthy server)**
- **Cause**: Health check during legitimate maintenance
- **Solution**:
  - Deactivate workflow during maintenance windows
  - Add maintenance mode flag check
  - Increase check interval to reduce false positives

**3. Restart command succeeds but server doesn't start**
- **Cause**: Server configuration error preventing startup
- **Solution**:
  - Check server startup logs
  - Verify disk space available
  - Check for port conflicts
  - Validate configuration files

**4. Notifications not sent**
- **Cause**: Webhook URL invalid or unreachable
- **Solution**:
  - Test webhook URLs independently
  - Check n8n execution logs for HTTP errors
  - Verify webhook service is operational

**5. "Permission denied" on power action**
- **Cause**: API key lacks power management permissions
- **Solution**: Ensure Client API credentials have server power control access

### Debugging Tips

1. **Monitor execution history**: Review past executions in n8n
2. **Check server logs**: Look for startup errors after restart
3. **Test restart manually**: Verify restart works from panel
4. **Add logging**: Insert HTTP Request nodes to log to external service
5. **Gradual rollout**: Test on non-critical server first

### Advanced: Prevent Restart Loops

Add cooldown mechanism:

```javascript
// Add Code node before "Restart Server"
const staticData = this.getWorkflowStaticData('global');
const lastRestart = staticData.lastRestartTime || 0;
const now = Date.now();
const cooldownMinutes = 30;

if (now - lastRestart < cooldownMinutes * 60 * 1000) {
  throw new Error('Cooldown active - server recently restarted');
}

staticData.lastRestartTime = now;
return items;
```

## Performance Considerations

- **Check interval**: 10 minutes provides good balance
- **Wait time**: 2 minutes adequate for most servers
- **Execution time**: 2-3 seconds (healthy), 125 seconds (recovery)
- **Resource impact**: Minimal on Pterodactyl panel
- **Multiple servers**: Monitor up to 50 servers with 10-minute intervals

## Related Workflows

- **02-server-resource-monitoring**: Proactive resource alerts
- **01-automated-server-backup**: Backup before auto-recovery

## Extension Ideas

1. **Backup before restart**: Create backup before attempting restart
2. **Gradual escalation**: Try start → restart → kill progression
3. **Status page integration**: Update public status page automatically
4. **Incident tracking**: Create tickets in JIRA/Linear for each incident
5. **Metrics dashboard**: Visualize uptime and recovery attempts
6. **Smart scheduling**: Skip checks during known maintenance windows
7. **Dependency checking**: Verify database/network connectivity before restart
8. **Cost optimization**: Shut down non-critical servers during off-hours
9. **Predictive recovery**: Use ML to predict crashes before they happen
10. **Multi-region failover**: Redirect traffic to backup server if primary fails

## Best Practices

1. **Test thoroughly**: Test on non-production servers first
2. **Set up alerts**: Ensure critical alerts reach on-call team
3. **Monitor patterns**: Track why servers crash to fix root causes
4. **Document incidents**: Keep record of all auto-recovery events
5. **Regular review**: Weekly review of recovery attempts and patterns
6. **Gradual rollout**: Enable for one server, then expand gradually
7. **Maintenance windows**: Disable during planned maintenance
8. **Backup strategy**: Combine with regular backup workflow
