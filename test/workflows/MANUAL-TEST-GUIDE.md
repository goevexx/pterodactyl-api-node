# Manual Testing Guide for Pterodactyl Node

Since the Pterodactyl node is mounted as a custom extension (not installed via npm), **you cannot import the workflow JSON directly**. Instead, follow this guide to manually test all operations.

## Why Can't I Import?

When nodes are mounted via `N8N_CUSTOM_EXTENSIONS`, n8n loads and executes them correctly, BUT it doesn't recognize them as "installed packages" for workflow import. The node works perfectly - you just need to create the workflow manually.

## Quick Test - Verify Node is Working

1. Create a new workflow in n8n
2. Add a **Manual Trigger** node
3. Click the **+** button to add another node
4. Search for **"Pterodactyl"**
5. You should see the Pterodactyl node with the custom icon
6. Select it and configure credentials

If you see the node, it's working! Proceed with testing.

## Testing All 29 Operations

### Setup

1. **Create credentials first:**
   - Click on any Pterodactyl node
   - Select "Pterodactyl Client API" credential type
   - Click "Create New"
   - Fill in your Panel URL and API Key
   - Save

2. **Get a server identifier:**
   - Add a Pterodactyl node
   - Resource: **Server**
   - Operation: **List**
   - Execute
   - Copy one of the server identifiers from the output

---

### Server Operations (5)

#### 1. List Servers
```
Resource: Server
Operation: List
Return All: true
```
**Expected:** Array of all your servers

#### 2. Get Server
```
Resource: Server
Operation: Get
Server ID: [paste identifier from list]
```
**Expected:** Detailed server information

#### 3. Get Resources
```
Resource: Server
Operation: Get Resources
Server ID: [paste identifier]
```
**Expected:** CPU, memory, disk usage stats

#### 4. Send Command
```
Resource: Server
Operation: Send Command
Server ID: [paste identifier]
Command: say Hello from n8n!
```
**Expected:** Command sent (server must be running)
⚠️ **Note:** Server must be online

#### 5. Power Action
```
Resource: Server
Operation: Power Action
Server ID: [paste identifier]
Action: restart
```
**Expected:** Power signal sent
⚠️ **Warning:** This will restart your server!

---

### File Operations (8)

#### 1. List Files
```
Resource: File
Operation: List
Server ID: [paste identifier]
Directory: /
```
**Expected:** Array of files and folders

#### 2. Create Folder
```
Resource: File
Operation: Create Folder
Server ID: [paste identifier]
Directory: /
Folder Name: n8n-test
```
**Expected:** Folder created

#### 3. Write File
```
Resource: File
Operation: Write
Server ID: [paste identifier]
File Path: /n8n-test/test.txt
File Content: Hello from n8n automated testing!
```
**Expected:** File created

#### 4. Read File
```
Resource: File
Operation: Read
Server ID: [paste identifier]
File Path: /n8n-test/test.txt
```
**Expected:** File content returned

#### 5. Compress Files
```
Resource: File
Operation: Compress
Server ID: [paste identifier]
Directory: /n8n-test
Files: ["test.txt"]
```
**Expected:** Archive created (archive.tar.gz)

#### 6. Decompress File
```
Resource: File
Operation: Decompress
Server ID: [paste identifier]
Directory: /n8n-test
File: archive.tar.gz
```
**Expected:** Archive extracted

#### 7. Get Upload URL
```
Resource: File
Operation: Get Upload URL
Server ID: [paste identifier]
```
**Expected:** Signed upload URL returned

#### 8. Delete File
```
Resource: File
Operation: Delete
Server ID: [paste identifier]
Directory: /n8n-test
Files: ["test.txt", "archive.tar.gz"]
```
**Expected:** Files deleted

---

### Database Operations (4)

#### 1. List Databases
```
Resource: Database
Operation: List
Server ID: [paste identifier]
```
**Expected:** Array of databases

#### 2. Create Database
```
Resource: Database
Operation: Create
Server ID: [paste identifier]
Database Name: n8n_test_db
Remote: %
```
**Expected:** Database created

#### 3. Rotate Password
```
Resource: Database
Operation: Rotate Password
Server ID: [paste identifier]
Database ID: [from list output]
```
**Expected:** New password generated

#### 4. Delete Database
```
Resource: Database
Operation: Delete
Server ID: [paste identifier]
Database ID: [from list output]
```
**Expected:** Database deleted

---

### Backup Operations (6)

#### 1. List Backups
```
Resource: Backup
Operation: List
Server ID: [paste identifier]
```
**Expected:** Array of backups

#### 2. Create Backup
```
Resource: Backup
Operation: Create
Server ID: [paste identifier]
Name: n8n-test-backup
Locked: false
```
**Expected:** Backup creation started

#### 3. Get Backup
```
Resource: Backup
Operation: Get
Server ID: [paste identifier]
Backup ID: [UUID from list]
```
**Expected:** Backup details

#### 4. Download Backup
```
Resource: Backup
Operation: Download
Server ID: [paste identifier]
Backup ID: [UUID from list]
```
**Expected:** Download URL returned

#### 5. Restore Backup
```
Resource: Backup
Operation: Restore
Server ID: [paste identifier]
Backup ID: [UUID from list]
```
**Expected:** Restore initiated
⚠️ **Warning:** This will restore your server!

#### 6. Delete Backup
```
Resource: Backup
Operation: Delete
Server ID: [paste identifier]
Backup ID: [UUID from list]
```
**Expected:** Backup deleted

---

### Account Operations (6)

#### 1. Get Account
```
Resource: Account
Operation: Get Account
```
**Expected:** Your account information

#### 2. List API Keys
```
Resource: Account
Operation: List API Keys
```
**Expected:** Array of your API keys

#### 3. Create API Key
```
Resource: Account
Operation: Create API Key
Description: n8n test key
Allowed IPs: [] (leave empty for all IPs)
```
**Expected:** New API key created with token

#### 4. Delete API Key
```
Resource: Account
Operation: Delete API Key
Identifier: [from list output]
```
**Expected:** API key deleted

#### 5. Update Email
```
Resource: Account
Operation: Update Email
Email: newemail@example.com
Password: [your current password]
```
**Expected:** Email update initiated
⚠️ **Warning:** Requires email confirmation

#### 6. Update Password
```
Resource: Account
Operation: Update Password
Current Password: [current]
New Password: [new]
Confirm Password: [new]
```
**Expected:** Password updated
⚠️ **Warning:** You will need to re-authenticate

---

## Checklist

Use this checklist to track your testing:

### Server (5)
- [ ] List Servers
- [ ] Get Server
- [ ] Get Resources
- [ ] Send Command
- [ ] Power Action

### File (8)
- [ ] List Files
- [ ] Create Folder
- [ ] Write File
- [ ] Read File
- [ ] Compress Files
- [ ] Decompress File
- [ ] Get Upload URL
- [ ] Delete File

### Database (4)
- [ ] List Databases
- [ ] Create Database
- [ ] Rotate Password
- [ ] Delete Database

### Backup (6)
- [ ] List Backups
- [ ] Create Backup
- [ ] Get Backup
- [ ] Download Backup
- [ ] Restore Backup (⚠️ careful!)
- [ ] Delete Backup

### Account (6)
- [ ] Get Account
- [ ] List API Keys
- [ ] Create API Key
- [ ] Delete API Key
- [ ] Update Email (⚠️ requires confirmation)
- [ ] Update Password (⚠️ careful!)

---

## Automated Testing (Alternative)

If you want to install the node properly for JSON import:

### Option 1: Publish to npm
1. Publish the package to npm: `npm publish`
2. Install in n8n: Settings → Community Nodes → Install
3. Package name: `n8n-nodes-pterodactyl`
4. Then you can import the workflow JSON

### Option 2: Local npm link
1. From project directory: `npm link`
2. In n8n container: `npm link n8n-nodes-pterodactyl`
3. Restart n8n
4. Then you can import the workflow JSON

For now, manual testing as described above is the simplest approach!
