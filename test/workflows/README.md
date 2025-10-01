# Pterodactyl Node - Test Workflows

This directory contains comprehensive test workflows for the Pterodactyl n8n node.

## Files

### `pterodactyl-comprehensive-test.json`

A complete test workflow that exercises all 29 operations across 5 resources provided by the Pterodactyl node.

**What it tests:**

#### Server Operations (5)
1. **List Servers** - Retrieves all accessible servers
2. **Get Server** - Gets detailed information about a specific server
3. **Get Server Resources** - Retrieves CPU, memory, and disk usage
4. **Send Command** - Executes a console command on the server
5. **Power Action** - (Not in automated test - requires manual trigger to avoid stopping servers)

#### File Operations (8)
1. **List Files** - Lists files and directories
2. **Create Folder** - Creates a test directory
3. **Write File** - Creates a test file
4. **Read File** - Reads the test file content
5. **Compress Files** - Creates a tar.gz archive
6. **Decompress File** - Extracts the archive
7. **Get Upload URL** - Gets a signed URL for file uploads
8. **Delete File** - Removes the test file

#### Database Operations (4)
1. **List Databases** - Lists all databases for a server
2. **Create Database** - Creates a test database
3. **Rotate Password** - Generates a new database password
4. **Delete Database** - Removes the test database

#### Backup Operations (6)
1. **List Backups** - Lists all backups
2. **Create Backup** - Creates a new backup
3. **Get Backup** - Gets backup details
4. **Download Backup** - Gets download URL for a backup
5. **Restore Backup** - (Not in automated test - requires manual trigger to avoid data loss)
6. **Delete Backup** - Removes the test backup

#### Account Operations (6)
1. **Get Account** - Retrieves account information
2. **List API Keys** - Lists all API keys
3. **Create API Key** - Creates a test API key
4. **Delete API Key** - Removes the test API key
5. **Update Email** - (Not in automated test - requires confirmation)
6. **Update Password** - (Not in automated test - requires old password)

## Important: Workflow Import Limitation

⚠️ **The workflow JSON cannot be imported directly when using `N8N_CUSTOM_EXTENSIONS`**

When the Pterodactyl node is mounted via `N8N_CUSTOM_EXTENSIONS` (as in our Docker setup), n8n loads and executes it perfectly, BUT it doesn't recognize it as an "installed package" for workflow import purposes.

**The node works - you just can't import JSON workflows!**

### Solution: Manual Testing

Please use **`MANUAL-TEST-GUIDE.md`** for step-by-step instructions on testing all 29 operations manually in the n8n UI.

### Alternative: Proper Installation

If you want to import the workflow JSON, you need to properly install the node:

1. **Publish to npm** (for production use)
2. **Use npm link** inside the n8n container
3. **Install via n8n Community Nodes** page after publishing

## How to Use (If Properly Installed)

### 1. Import the Workflow

1. Open your n8n instance
2. Click **Import from File**
3. Select `pterodactyl-comprehensive-test.json`
4. Click **Import**

⚠️ **Note:** This only works if the node is installed via npm, not mounted via custom extensions

### 2. Configure Credentials

The workflow uses **Pterodactyl Client API** credentials. You must set these up before running:

1. In any Pterodactyl node, click the credential selector
2. Click **Create New Credential**
3. Fill in:
   - **Panel URL**: Your Pterodactyl panel URL (e.g., `https://panel.example.com`)
   - **API Key**: Your Client API key (starts with `ptlc_`)
4. Save the credential

### 3. Run the Test

1. Click **Execute Workflow** on the Manual Trigger node
2. Watch as each operation executes sequentially
3. Check the output of each node to verify it worked correctly

### 4. Review Results

The workflow ends with a **Test Summary** node that confirms all operations completed successfully.

## Expected Behavior

- **Green nodes**: Operations completed successfully
- **Red nodes**: Operation failed (check error message)
- **Data flow**: Each node passes data to the next node

## Notes

⚠️ **This workflow creates and deletes test data on your Pterodactyl server:**
- Creates a folder `/n8n-test-folder`
- Creates a test file `/n8n-test-folder/test.txt`
- Creates a test database `n8n_test_db`
- Creates a backup named `n8n-automated-test-backup`
- Creates an API key named `n8n automated test key`
- All test data is cleaned up at the end

⚠️ **Make sure you have:**
- At least one server in your Pterodactyl panel
- Sufficient permissions to create databases and backups
- A server that is running (for the Send Command operation)

## Validation

The workflow has been validated using the n8n MCP validation tool:

```json
{
  "valid": true,
  "summary": {
    "totalNodes": 27,
    "enabledNodes": 27,
    "triggerNodes": 1,
    "validConnections": 25,
    "invalidConnections": 0,
    "expressionsValidated": 50+,
    "errorCount": 0,
    "warningCount": 0
  }
}
```

## Troubleshooting

### "No servers found"
- Make sure you have at least one server in your Pterodactyl panel
- Check that your API key has access to list servers

### "Database creation failed"
- Ensure your server has available database slots
- Check that your API key has permission to create databases

### "Backup creation failed"
- Make sure backups are enabled for your server
- Check that you haven't exceeded the backup limit

### "Command execution failed"
- The server must be **running** to accept console commands
- Some game servers may not support the echo command - adjust the command as needed

## Manual Testing

Some operations are not included in the automated test to prevent accidental data loss:

### Power Action
```json
{
  "resource": "server",
  "operation": "powerAction",
  "serverId": "your-server-id",
  "action": "restart"
}
```

### Restore Backup
```json
{
  "resource": "backup",
  "operation": "restore",
  "serverId": "your-server-id",
  "backupId": "backup-uuid"
}
```

### Update Email
```json
{
  "resource": "account",
  "operation": "updateEmail",
  "email": "new@example.com",
  "password": "current-password"
}
```

### Update Password
```json
{
  "resource": "account",
  "operation": "updatePassword",
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

## Contributing

If you find issues with the test workflow or want to add more test cases, please submit a pull request.
