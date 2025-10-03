# Database Provisioning

## Overview

This workflow automates MySQL database creation for Pterodactyl servers. It validates server existence, checks database limits, creates a new database with secure credentials, writes the connection details to a `.env.database` file on the server, and sends notifications. Perfect for automated server provisioning, customer onboarding, or self-service database creation workflows.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Pterodactyl Panel with API access
- Pterodactyl Client API credentials configured in n8n
- Server with database feature enabled
- Webhook endpoint for notifications (optional)

## Setup Instructions

### 1. Import Workflow

1. Copy the contents of `workflow.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Paste the JSON content and import

### 2. Configure Credentials

1. Open any **Pterodactyl node** (e.g., "Validate Server Exists")
2. Select your Pterodactyl credentials
3. All Pterodactyl nodes will use the same credentials

### 3. Configure Notifications (Optional)

1. Open **Send Success Notification** node
2. Replace `https://your-webhook-url.com/database-provisioned` with your webhook URL
3. Open **Send Limit Error** node
4. Replace `https://your-webhook-url.com/database-limit-reached` with your webhook URL

### 4. Test the Workflow

#### Manual Test
1. Click **Execute Workflow**
2. The workflow uses default parameters:
   - Database name: Auto-generated with timestamp
   - Remote access: `%` (allow from any host)

#### Custom Parameters Test
1. Open **Manual Trigger** node
2. Click **Execute Workflow**
3. In the input panel, provide:
```json
{
  "server_id": "your-server-identifier",
  "database_name": "my_app_db",
  "remote_access": "%"
}
```

## Usage

### How It Works

1. **Trigger manually** or via webhook
2. **Set parameters**: Server ID, database name, remote access
3. **Validate server**: Ensure server exists and get limits
4. **List existing databases**: Check current database count
5. **Check limit**: Compare count against server's database limit
6. **If under limit**:
   - Create new database
   - Write credentials to `.env.database` file
   - Send success notification
7. **If at limit**:
   - Send error notification with current count and limit

### Input Parameters

**Required:**
- `server_id`: Pterodactyl server identifier

**Optional:**
- `database_name`: Database name (default: auto-generated with timestamp)
- `remote_access`: Host pattern for remote connections (default: `%` = allow from anywhere)

### Auto-Generated Database Names

If no `database_name` is provided, the workflow generates one with format:
```
app_db_20251003_160000
```

### Remote Access Patterns

- `%`: Allow from any host (default)
- `localhost`: Local connections only
- `192.168.1.%`: Specific subnet
- `example.com`: Specific hostname

## Integration Examples

### Webhook Integration

Convert to webhook trigger for external systems:

1. Replace **Manual Trigger** with **Webhook Trigger**
2. POST to the webhook with:
```json
{
  "server_id": "minecraft-server",
  "database_name": "mc_players",
  "remote_access": "%"
}
```

### Billing System Integration

Trigger from customer signup:

```javascript
// In your billing system
fetch('https://your-n8n.com/webhook/provision-database', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    server_id: customer.server_id,
    database_name: `customer_${customer.id}_db`,
    remote_access: '%'
  })
});
```

### Multi-Database Provisioning

Create multiple databases for one server:

```json
{
  "server_id": "app-server",
  "databases": [
    {"name": "app_production", "remote": "%"},
    {"name": "app_staging", "remote": "localhost"},
    {"name": "app_cache", "remote": "%"}
  ]
}
```

Modify workflow to loop through the array using **Split In Batches**.

## Customization Guide

### Custom Credentials File Format

Modify the **Write Credentials to File** node to match your application's format:

#### Laravel `.env` Format
```
DB_CONNECTION=mysql
DB_HOST={{ $json.host.address }}
DB_PORT={{ $json.host.port }}
DB_DATABASE={{ $json.name }}
DB_USERNAME={{ $json.username }}
DB_PASSWORD={{ $json.password }}
```

#### WordPress `wp-config.php` Format
```php
define('DB_NAME', '{{ $json.name }}');
define('DB_USER', '{{ $json.username }}');
define('DB_PASSWORD', '{{ $json.password }}');
define('DB_HOST', '{{ $json.host.address }}:{{ $json.host.port }}');
```

#### JSON Configuration
```json
{
  "database": {
    "host": "{{ $json.host.address }}",
    "port": {{ $json.host.port }},
    "name": "{{ $json.name }}",
    "username": "{{ $json.username }}",
    "password": "{{ $json.password }}"
  }
}
```

### Add Database Initialization

After creating the database, run initialization SQL:

1. Add **HTTP Request** node after "Create Database"
2. Connect to database and run schema:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Complexity Validation

The workflow uses Pterodactyl's auto-generated passwords. To customize:

1. Add **Code** node before "Create Database"
2. Generate custom password:
```javascript
const crypto = require('crypto');
const password = crypto.randomBytes(16).toString('base64');
items[0].json.custom_password = password;
return items;
```

### Automatic Backup After Creation

Add backup for safety:

1. Add **Pterodactyl: Create Backup** node after "Create Database"
2. Ensures you can restore if initialization fails

### Email Credentials

Instead of webhook, send via email:

1. Replace **Send Success Notification** with **Send Email** node
2. Configure SMTP credentials
3. Email template:
```
Subject: Database Provisioned Successfully

Your database has been created:

Host: {{ $node['Create Database'].json.host.address }}
Port: {{ $node['Create Database'].json.host.port }}
Database: {{ $node['Create Database'].json.name }}
Username: {{ $node['Create Database'].json.username }}
Password: {{ $node['Create Database'].json.password }}

Connection string:
mysql://{{ $json.username }}:{{ $json.password }}@{{ $json.host.address }}:{{ $json.host.port }}/{{ $json.name }}
```

## Expected Behavior

### Successful Provisioning

**Database Created:**
- New MySQL database on Pterodactyl panel
- Random username and password generated
- Connection details written to `/.env.database`

**Notification Payload:**
```json
{
  "status": "success",
  "server_id": "my-server",
  "database_name": "app_db_20251003_160000",
  "database_host": "mysql.example.com",
  "database_port": 3306,
  "database_username": "u123_abc456",
  "credentials_file": "/.env.database",
  "timestamp": "2025-10-03T16:00:00.000Z"
}
```

**Credentials File (/.env.database):**
```
# Database Configuration
# Auto-generated: 2025-10-03T16:00:00.000Z

DB_HOST=mysql.example.com
DB_PORT=3306
DB_DATABASE=app_db_20251003_160000
DB_USERNAME=u123_abc456
DB_PASSWORD=SecureRandomPassword123!

# Connection String
DATABASE_URL=mysql://u123_abc456:SecureRandomPassword123!@mysql.example.com:3306/app_db_20251003_160000
```

### Database Limit Reached

**Error Notification:**
```json
{
  "status": "error",
  "error": "database_limit_reached",
  "server_id": "my-server",
  "current_count": 5,
  "limit": 5,
  "timestamp": "2025-10-03T16:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

**1. "Server not found" error**
- **Cause**: Invalid server ID
- **Solution**: Verify server identifier in Pterodactyl panel

**2. "Permission denied" creating database**
- **Cause**: API key lacks database management permissions
- **Solution**: Ensure Client API key has database creation access

**3. "Database limit reached" but panel shows available slots**
- **Cause**: Cached data or incorrect limit detection
- **Solution**:
  - Check server's feature limits in panel
  - Verify `feature_limits.databases` exists in server response
  - Add error handling for missing limits

**4. Credentials file not created**
- **Cause**: File write permission denied or invalid path
- **Solution**:
  - Verify API key has file management permissions
  - Check file path is valid for the server
  - Ensure server is in "running" or "offline" state (not "installing")

**5. Database created but connection fails**
- **Cause**: Remote access pattern too restrictive
- **Solution**:
  - Use `%` for remote access to allow from anywhere
  - Verify firewall allows MySQL port (3306)
  - Check database host is accessible from application

### Debugging Tips

1. **Check server limits**: Click "Validate Server Exists" after execution to see feature_limits
2. **Verify database count**: Click "List Existing Databases" to see current databases
3. **Test credentials**: Use the connection string to test database access manually
4. **Check file contents**: Read `/.env.database` using Pterodactyl file manager

### Security Best Practices

**1. Secure Credential Storage**
- Credentials are auto-generated with high entropy
- Store in file with restricted permissions
- Consider encrypting the `.env.database` file

**2. Remote Access Restrictions**
```javascript
// Only allow from specific IP
"remote_access": "203.0.113.0"

// Only allow from subnet
"remote_access": "192.168.1.%"

// Local only
"remote_access": "localhost"
```

**3. Credential Rotation**
- Implement periodic password rotation
- Store old credentials temporarily for migration
- Update application config automatically

**4. Audit Trail**
- Log all database creations
- Track who requested each database
- Monitor for unusual provisioning patterns

## Performance Considerations

- **Execution time**: 5-10 seconds per database
- **Rate limiting**: Respects Pterodactyl API limits
- **Concurrent requests**: Can handle multiple provisioning requests
- **Database limits**: Typically 1-10 databases per server (panel dependent)

## Related Workflows

- **05-user-onboarding**: Complete server provisioning with database
- **01-automated-server-backup**: Backup databases regularly

## Extension Ideas

1. **Database migration**: Auto-migrate schema from template database
2. **User management**: Create additional database users with limited permissions
3. **Monitoring**: Set up database performance monitoring
4. **Cleanup automation**: Delete unused databases after N days
5. **Database clustering**: Provision across multiple database servers
6. **Quota management**: Track and enforce database size limits
7. **Backup scheduling**: Auto-schedule backups for new databases
