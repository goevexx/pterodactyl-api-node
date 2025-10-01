# Testing the Pterodactyl n8n Node

## Quick Start with Docker

### 1. Build the Node
```bash
npm run build
```

### 2. Start n8n with the Node
```bash
docker-compose up -d
```

### 3. Access n8n
Open your browser to: **http://localhost:5678**

On first launch, you'll be prompted to create an admin account.

### 4. Find the Pterodactyl Node
1. Create a new workflow
2. Click the "+" button to add a node
3. Search for "Pterodactyl"
4. You should see the Pterodactyl node with the custom icon

### 5. Configure Credentials

#### Client API Credentials (User-level access)
1. Click on "Credentials" in the Pterodactyl node
2. Select "Create New Credential" → "Pterodactyl Client API"
3. Fill in:
   - **Panel URL**: Your Pterodactyl panel URL (e.g., `https://panel.example.com`)
   - **API Key**: Your client API key (starts with `ptlc_`)
4. Click "Create"

#### Application API Credentials (Admin-level access)
1. Click on "Credentials" in the Pterodactyl node
2. Select "Create New Credential" → "Pterodactyl Application API"
3. Fill in:
   - **Panel URL**: Your Pterodactyl panel URL
   - **API Key**: Your application API key (starts with `ptla_`)
4. Click "Create"

### 6. Test the Node

Try these safe operations first:

#### Test 1: List Servers
- Resource: **Server**
- Operation: **List**
- Click "Execute Node"

#### Test 2: Get Server Details
- Resource: **Server**
- Operation: **Get**
- Server Identifier: `<your-server-id>`
- Click "Execute Node"

#### Test 3: List Files
- Resource: **File**
- Operation: **List**
- Server Identifier: `<your-server-id>`
- Directory: `/`
- Click "Execute Node"

## Troubleshooting

### Node Not Appearing
```bash
# Check if files are mounted correctly
docker exec n8n-pterodactyl-test ls -la /data/custom/n8n-nodes-pterodactyl/

# Check n8n logs
docker-compose logs -f n8n

# Restart n8n
docker-compose restart
```

### Rebuild After Changes
```bash
# Rebuild the node
npm run build

# Restart n8n to pick up changes
docker-compose restart
```

### View n8n Logs
```bash
docker-compose logs -f n8n
```

### Stop and Remove
```bash
# Stop n8n
docker-compose down

# Stop and remove volumes (deletes all workflows!)
docker-compose down -v
```

## Available Operations

### Server (5 operations)
- ✅ List - Get all accessible servers
- ✅ Get - Get server details
- ✅ Power Action - Start/stop/restart/kill server
- ✅ Send Command - Execute console command
- ✅ Get Resources - Real-time CPU/memory/disk usage

### File (8 operations)
- ✅ List - Browse files and directories
- ✅ Read - Read file contents
- ✅ Write - Create/update file
- ✅ Delete - Delete files
- ✅ Compress - Create archive
- ✅ Decompress - Extract archive
- ✅ Create Folder - Create directory
- ✅ Get Upload URL - Get signed upload URL

### Database (4 operations)
- ✅ List - List all databases
- ✅ Create - Create new database
- ✅ Rotate Password - Generate new password
- ✅ Delete - Delete database

### Backup (6 operations)
- ✅ List - List all backups
- ✅ Create - Create new backup
- ✅ Get - Get backup details
- ✅ Download - Get download URL
- ✅ Restore - Restore backup to server
- ✅ Delete - Delete backup

### Account (6 operations - Client API only)
- ✅ Get Account - Get account details
- ✅ Update Email - Change email address
- ✅ Update Password - Change password
- ✅ List API Keys - List all API keys
- ✅ Create API Key - Create new API key
- ✅ Delete API Key - Delete API key

## Getting API Keys

### Client API Key
1. Log into your Pterodactyl panel
2. Go to **Account** → **API Credentials**
3. Click **Create API Key**
4. Copy the key (starts with `ptlc_`)

### Application API Key
1. Log into your Pterodactyl panel as admin
2. Go to **Admin Panel** → **Application API**
3. Click **Create New**
4. Give appropriate permissions
5. Copy the key (starts with `ptla_`)

## Example Workflows

### Automated Server Backup
1. Trigger: Schedule (daily at 3 AM)
2. Pterodactyl: List Servers
3. Loop through servers
4. Pterodactyl: Create Backup for each server
5. Send notification on completion

### Server Monitoring
1. Trigger: Schedule (every 5 minutes)
2. Pterodactyl: Get Resources
3. Check if CPU/memory > threshold
4. Send alert if needed

### File Deployment
1. Trigger: Webhook
2. HTTP Request: Download file from Git
3. Pterodactyl: Write File to server
4. Pterodactyl: Send Command (restart service)

## Support

If you encounter issues:
1. Check the n8n logs: `docker-compose logs -f n8n`
2. Verify your API keys are correct
3. Ensure your Pterodactyl panel is accessible from the Docker container
4. Check Pterodactyl API rate limits (720/min for Client API, 240/min for Application API)
