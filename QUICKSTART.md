# 🚀 Quick Start Guide

## Your n8n instance is now running!

**Access n8n at:** http://localhost:5678

---

## ✅ What's Running

- **Container**: `n8n-pterodactyl-test`
- **Port**: 5678
- **Status**: Healthy
- **Custom Node**: Pterodactyl API Node (pre-installed)

---

## 📝 First Time Setup

### 1. Create Your n8n Account
1. Open http://localhost:5678 in your browser
2. Fill in your details to create the admin account
3. Click "Get Started"

### 2. Find the Pterodactyl Node
1. Create a new workflow (click "New Workflow")
2. Click the **"+"** button to add a node
3. Search for **"Pterodactyl"**
4. You should see the node with the custom icon

### 3. Configure Credentials

Before using the node, you need to set up credentials:

#### For Client API (User-level Access)
1. In the Pterodactyl node, click **"Credential for Pterodactyl Client API"**
2. Click **"Create New Credential"**
3. Fill in:
   - **Panel URL**: `https://your-panel.example.com`
   - **API Key**: `ptlc_xxxxxxxxxxxxxxxxxx`
4. Click **"Create"**

**Where to get your Client API Key:**
- Log into your Pterodactyl panel
- Go to **Account** → **API Credentials**
- Click **"Create API Key"**
- Copy the key (starts with `ptlc_`)

#### For Application API (Admin Access)
1. In the Pterodactyl node, select **"Application API"** as authentication type
2. Click **"Credential for Pterodactyl Application API"**
3. Click **"Create New Credential"**
4. Fill in:
   - **Panel URL**: `https://your-panel.example.com`
   - **API Key**: `ptla_xxxxxxxxxxxxxxxxxx`
5. Click **"Create"**

**Where to get your Application API Key:**
- Log into your Pterodactyl panel as admin
- Go to **Admin Panel** → **Application API**
- Click **"Create New"**
- Set permissions and copy the key (starts with `ptla_`)

---

## 🧪 Test the Node

Try these safe operations:

### Test 1: List Your Servers
1. Resource: **Server**
2. Operation: **List**
3. Click **"Execute Node"**
4. You should see all your servers

### Test 2: Get Server Details
1. Resource: **Server**
2. Operation: **Get**
3. Enter a **Server Identifier** (from the list above)
4. Click **"Execute Node"**

### Test 3: Browse Server Files
1. Resource: **File**
2. Operation: **List**
3. Enter a **Server Identifier**
4. Directory: `/`
5. Click **"Execute Node"**

---

## 🐳 Docker Commands

### View Logs
```bash
docker-compose logs -f n8n
```

### Restart n8n
```bash
docker-compose restart
```

### Stop n8n
```bash
docker-compose down
```

### Rebuild Node After Changes
```bash
npm run build
docker-compose restart
```

### Remove Everything (including workflows)
```bash
docker-compose down -v
```

---

## 📚 Available Resources

Your Pterodactyl node supports **5 resources** with **29 operations**:

### 🖥️ Server (5 operations)
- **List** - Get all accessible servers
- **Get** - Get detailed server info
- **Power Action** - Start/Stop/Restart/Kill
- **Send Command** - Execute console commands
- **Get Resources** - CPU/Memory/Disk usage

### 📁 File (8 operations)
- **List** - Browse files/directories
- **Read** - Read file contents
- **Write** - Create/update files
- **Delete** - Remove files
- **Compress** - Create archives (.tar.gz)
- **Decompress** - Extract archives
- **Create Folder** - Make directories
- **Get Upload URL** - Get signed upload URL

### 🗄️ Database (4 operations)
- **List** - Show all databases
- **Create** - Create new database
- **Rotate Password** - Generate new password
- **Delete** - Remove database

### 💾 Backup (6 operations)
- **List** - Show all backups
- **Create** - Create new backup
- **Get** - Get backup details
- **Download** - Get download URL
- **Restore** - Restore backup
- **Delete** - Remove backup

### 👤 Account (6 operations - Client API only)
- **Get Account** - Account details
- **Update Email** - Change email
- **Update Password** - Change password
- **List API Keys** - Show API keys
- **Create API Key** - Generate new key
- **Delete API Key** - Remove key

---

## 💡 Example Workflows

### Automated Backup
**Trigger**: Schedule (daily 3 AM)
1. Pterodactyl: List Servers
2. Loop: For each server
3. Pterodactyl: Create Backup
4. Notification: Email results

### Server Monitor
**Trigger**: Schedule (every 5 min)
1. Pterodactyl: Get Resources
2. IF: CPU > 80%
3. Notification: Send alert

### Auto Deploy
**Trigger**: Webhook (from Git)
1. HTTP: Download file
2. Pterodactyl: Write File
3. Pterodactyl: Send Command (restart)

---

## 🔧 Troubleshooting

### Node not appearing?
```bash
# Check if files are mounted
docker exec n8n-pterodactyl-test ls -la /data/custom/n8n-nodes-pterodactyl/

# Restart n8n
docker-compose restart
```

### Credentials not working?
- Verify your Pterodactyl panel URL (no trailing slash)
- Check API key format (`ptlc_` for Client, `ptla_` for Application)
- Ensure API key has necessary permissions
- Test panel URL is accessible from Docker: `docker exec n8n-pterodactyl-test curl -I https://your-panel.com`

### Rate limit errors?
- Client API: 720 requests per minute
- Application API: 240 requests per minute
- The node has automatic retry with exponential backoff

---

## 📖 Need Help?

- **Pterodactyl API Docs**: https://dashflo.net/docs/api/pterodactyl/v1/
- **n8n Documentation**: https://docs.n8n.io
- **Docker Logs**: `docker-compose logs -f n8n`

---

**Happy Automating! 🎉**
