# Pterodactyl Dropdown Test Workflows

This directory contains comprehensive test workflows for validating the dropdown functionality across all Pterodactyl operations.

## Quick Start

### 1. Import the Workflow

**Option A: Via n8n UI**
1. Open n8n in your browser
2. Click "Workflows" → "Import from File"
3. Select `comprehensive-dropdown-test.json`
4. Click "Import"

**Option B: Via n8n CLI**
```bash
n8n import:workflow --input=test-workflows/comprehensive-dropdown-test.json
```

### 2. Configure Credentials

The workflow requires two credential sets:

**Application API Credential:**
1. In n8n, go to "Credentials"
2. Create new "Pterodactyl Application API" credential
3. Enter your panel URL (e.g., `https://panel.example.com`)
4. Enter your Application API key
5. Save as "Pterodactyl Application API"

**Client API Credential:**
1. Create new "Pterodactyl Client API" credential
2. Enter your panel URL
3. Enter your Client API key
4. Save as "Pterodactyl Client API"

### 3. Run the Test Workflow

1. Open the imported workflow
2. Click "Execute Workflow" or use manual trigger
3. Each node will execute in sequence
4. Watch the dropdowns populate in real-time

---

## Test Workflow Structure

### Application API Tests (Nodes 1-13)

| Node | Test Type | What to Verify |
|------|-----------|----------------|
| **App: List Users** | List operation | Baseline data |
| **App: Get User** | ✅ **DROPDOWN** | User dropdown loads and displays |
| **App: List Locations** | List operation | Baseline data |
| **App: Get Location** | ✅ **DROPDOWN** | Location dropdown loads |
| **App: List Nodes** | List operation | Baseline data |
| **App: Get Node** | ✅ **DROPDOWN** | Node dropdown loads |
| **App: List Allocations** | ✅ **DEPENDENT** | Allocation dropdown depends on node |
| **App: List Nests** | List operation | Baseline data |
| **App: Get Nest** | ✅ **DROPDOWN** | Nest dropdown loads |
| **App: Get Egg** | ✅ **DEPENDENT** | Egg dropdown depends on nest |
| **App: List Servers** | List operation | Baseline data |
| **App: Get Server** | ✅ **DROPDOWN** | Server dropdown loads |

### Client API Tests (Nodes 14-23)

| Node | Test Type | What to Verify |
|------|-----------|----------------|
| **Client: List Servers** | List operation | Baseline data |
| **Client: Get Server** | ✅ **DROPDOWN** | Server dropdown loads |
| **Client: List Backups** | ✅ **DEPENDENT** | Backup dropdown depends on server |
| **Client: List Databases** | ✅ **DEPENDENT** | Database dropdown depends on server |
| **Client: List Schedules** | ✅ **DEPENDENT** | Schedule dropdown depends on server |
| **Client: Get Schedule** | ✅ **NESTED** | Schedule depends on server + scheduleId |
| **Client: List Allocations** | ✅ **DEPENDENT** | Allocation dropdown depends on server |
| **Client: List Subusers** | ✅ **DEPENDENT** | Subuser dropdown depends on server |
| **Client: List Files** | ✅ **DEPENDENT** | File path dropdown depends on server |

---

## Test Checklist

### ✅ Dropdown Loading Tests

For each dropdown node, verify:
- [ ] Dropdown appears (not a text input field)
- [ ] Entity names are displayed with IDs (e.g., "Main Server (ID: 1)")
- [ ] Multiple entities show in the list
- [ ] Empty state shows helpful message if no entities
- [ ] Error state shows user-friendly message on API failure

### ✅ Dependent Dropdown Tests

For dependent dropdowns (Egg, Allocation, Backups, etc.):
- [ ] Dropdown is empty before parent is selected
- [ ] Dropdown populates after parent entity is selected
- [ ] Dropdown updates when parent selection changes
- [ ] `loadOptionsDependsOn` working correctly

### ✅ Nested Dependency Tests

For multi-level dependencies (Server → Schedule → Task):
- [ ] First level dropdown works independently
- [ ] Second level depends on first level
- [ ] Changing first level resets and updates second level
- [ ] All levels can be selected successfully

### ✅ Type Consistency Tests

Verify correct data types:
- [ ] Application API: All IDs are numbers
- [ ] Client API: All IDs/identifiers are strings
- [ ] No type mismatch errors in execution

---

## Manual Testing Guide

### Phase 1: Independent Dropdowns

1. **Test User Dropdown**
   - Open "App: Get User" node
   - Click on "User" field
   - ✅ Verify dropdown shows users with emails and IDs
   - Select a user
   - Execute node
   - ✅ Verify correct user is retrieved

2. **Test Location Dropdown**
   - Open "App: Get Location" node
   - Click on "Location" field
   - ✅ Verify dropdown shows locations with short/long codes
   - Select a location
   - Execute node

3. **Test Node Dropdown**
   - Open "App: Get Node" node
   - Click on "Node" field
   - ✅ Verify dropdown shows nodes with names and IDs
   - Select a node

4. **Test Server Dropdown**
   - Open "App: Get Server" node
   - Click on "Server" field
   - ✅ Verify dropdown shows servers with names
   - Select a server

### Phase 2: Dependent Dropdowns (Simple)

5. **Test Nest → Egg Dependency**
   - Open "App: Get Egg" node
   - Click on "Nest" field
   - ✅ Verify nest dropdown loads
   - Select a nest (e.g., "Minecraft")
   - Click on "Egg" field
   - ✅ Verify egg dropdown now shows eggs for that nest
   - Change nest selection
   - ✅ Verify egg dropdown updates with new nest's eggs

6. **Test Node → Allocation Dependency**
   - Open "App: List Allocations" node
   - Click on "Node" field
   - Select a node
   - ✅ Verify the node's allocations will be listed

### Phase 3: Client API Server Dependencies

7. **Test Server-Dependent Dropdowns**
   - Open any Client API node (Backup, Database, Schedule, etc.)
   - Click on "Server" field
   - ✅ Verify server dropdown loads
   - Select a server
   - Execute node
   - ✅ Verify operation works with selected server

8. **Test Backup Dropdown**
   - Open "Client: List Backups" node
   - Select server from dropdown
   - Node will list backups for that server

### Phase 4: Nested Dependencies

9. **Test Server → Schedule → Task Chain**
   - Open "Client: Get Schedule" node
   - Select server from dropdown
   - ✅ Verify schedule dropdown populates
   - Select a schedule
   - ✅ Verify you can select from available schedules

---

## Expected Dropdown Behavior

### When Dropdown Loads Successfully:
```
┌─────────────────────────────────────┐
│ Server                        ▼     │
├─────────────────────────────────────┤
│ Main Server (ID: 1)                 │
│ Testing Server (ID: 2)              │
│ Production Server (ID: 3)           │
└─────────────────────────────────────┘
```

### When No Entities Exist:
```
┌─────────────────────────────────────┐
│ Server                        ▼     │
├─────────────────────────────────────┤
│ No servers found - create one first │
└─────────────────────────────────────┘
```

### When API Error Occurs:
```
┌─────────────────────────────────────┐
│ Server                        ▼     │
├─────────────────────────────────────┤
│ Error: Connection refused           │
└─────────────────────────────────────┘
```

### Dependent Dropdown (Before Parent Selected):
```
┌─────────────────────────────────────┐
│ Egg                           ▼     │
├─────────────────────────────────────┤
│ (empty - select a nest first)       │
└─────────────────────────────────────┘
```

### Dependent Dropdown (After Parent Selected):
```
Nest: Minecraft

┌─────────────────────────────────────┐
│ Egg                           ▼     │
├─────────────────────────────────────┤
│ Vanilla (ID: 1)                     │
│ Paper (ID: 2)                       │
│ Forge (ID: 3)                       │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### Dropdowns Don't Load

**Problem:** Dropdown shows as text input instead of dropdown
**Solution:**
- Verify you're using the latest version with dropdown support
- Check that `loadOptionsMethod` is defined in the node
- Rebuild the project: `npm run build`

**Problem:** Dropdown is empty (no options)
**Solution:**
- Check API credentials are correct
- Verify the Pterodactyl panel is accessible
- Check that entities exist (e.g., you have users/servers created)
- Look at browser console for API errors

### Dependent Dropdowns Don't Update

**Problem:** Child dropdown doesn't populate after parent selection
**Solution:**
- Ensure parent field is set correctly
- Check that `loadOptionsDependsOn` is configured
- Try deselecting and reselecting the parent

### Type Errors

**Problem:** "Expected number but got string" errors
**Solution:**
- Application API should use number type
- Client API should use string type
- Verify the operation file has correct type definitions

---

## Success Criteria

All tests pass if:

✅ **All independent dropdowns load entity lists**
✅ **All dependent dropdowns update when parent changes**
✅ **Nested dependencies work (Server → Schedule → Task)**
✅ **Empty states show helpful messages**
✅ **Error states handle gracefully**
✅ **Entity names display with IDs**
✅ **No TypeScript or runtime errors**
✅ **Operations execute successfully with dropdown selections**

---

## Additional Manual Tests

Beyond the workflow, manually test these scenarios:

### 1. Create Server with All Dropdowns
- Create a new server using Application API
- Verify: User, Nest, Egg, Node, Allocation all use dropdowns
- Verify: Egg dropdown changes when Nest changes

### 2. Update Operations
- Test update operations (updateServerDetails, updateUser, etc.)
- Verify dropdowns work in update context

### 3. Delete Operations
- Test delete operations
- Verify entity selection via dropdown works

### 4. Edge Cases
- Test with 100+ entities (performance)
- Test with special characters in names
- Test with very long entity names
- Test rapid parent selection changes

---

## Reporting Issues

If you find dropdown issues:

1. **Identify the specific operation:**
   - Node type (Application/Client)
   - Resource (server, user, backup, etc.)
   - Operation (get, list, create, etc.)

2. **Describe the behavior:**
   - What dropdown field has the issue?
   - Is it independent or dependent?
   - What's the expected vs. actual behavior?

3. **Provide context:**
   - Browser console errors
   - n8n version
   - Node package version
   - Pterodactyl panel version

4. **Open an issue:**
   ```
   Title: Dropdown not working for [Resource] [Operation]

   Description: The [field] dropdown in [operation] does not...

   Steps to reproduce:
   1. Open [node]
   2. Click on [field]
   3. Observe [issue]

   Expected: Should show [expected behavior]
   Actual: Shows [actual behavior]
   ```

---

## Files in This Directory

- `comprehensive-dropdown-test.json` - Main test workflow
- `README.md` - This file
- (Future) `edge-case-tests.json` - Edge case scenarios
- (Future) `performance-test.json` - Large dataset tests

---

**Happy Testing!** 🚀

If all dropdowns work correctly, you have successfully implemented dynamic dropdowns across all 88 Pterodactyl operations!
