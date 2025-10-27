# Untested Application API Operations Analysis

**Date:** 2025-10-24
**Status:** Analysis of operations not covered in "Comprehensive Pterodactyl Dropdown Test"

---

## Operations Tested in Workflow

### ✅ Tested Operations (9 total)

**User Operations (2):**
1. ✅ User → List
2. ✅ User → Get (dropdown test)

**Location Operations (2):**
3. ✅ Location → List
4. ✅ Location → Get (dropdown test)

**Node Operations (3):**
5. ✅ Node → List
6. ✅ Node → Get (dropdown test)
7. ✅ Node → List Allocations (dependent dropdown: nodeId)

**Nest Operations (3):**
8. ✅ Nest → List
9. ✅ Nest → Get (dropdown test)
10. ✅ Nest → Get Egg (dependent dropdown: nestId → eggId)

**Server Operations (2):**
11. ✅ Server → List
12. ✅ Server → Get (dropdown test)

---

## Untested Application API Operations

### ❌ Untested User Operations (4)

**13. User → Get By External ID**
- **File:** `actions/user/getUserByExternalId.operation.ts`
- **Dropdown Fields:** None (uses externalId string input)
- **Why Not Tested:** No dropdowns to test
- **Testing Priority:** LOW (no dropdown functionality)

**14. User → Create**
- **File:** `actions/user/createUser.operation.ts`
- **Dropdown Fields:** None (creates new user with form fields)
- **Why Not Tested:** No dropdowns to test
- **Testing Priority:** LOW (no dropdown functionality)

**15. User → Update**
- **File:** `actions/user/updateUser.operation.ts`
- **Dropdown Fields:**
  - `userId` dropdown ✅ (uses `getUsers` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**16. User → Delete**
- **File:** `actions/user/deleteUser.operation.ts`
- **Dropdown Fields:**
  - `userId` dropdown ✅ (uses `getUsers` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

---

### ❌ Untested Location Operations (3)

**17. Location → Create**
- **File:** `actions/location/createLocation.operation.ts`
- **Dropdown Fields:** None (creates new location with form fields)
- **Why Not Tested:** No dropdowns to test
- **Testing Priority:** LOW (no dropdown functionality)

**18. Location → Update**
- **File:** `actions/location/updateLocation.operation.ts`
- **Dropdown Fields:**
  - `locationId` dropdown ✅ (uses `getLocations` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**19. Location → Delete**
- **File:** `actions/location/deleteLocation.operation.ts`
- **Dropdown Fields:**
  - `locationId` dropdown ✅ (uses `getLocations` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

---

### ❌ Untested Node Operations (6)

**20. Node → Create**
- **File:** `actions/node/createNode.operation.ts`
- **Dropdown Fields:**
  - `locationId` dropdown ✅ (uses `getLocations` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**21. Node → Update**
- **File:** `actions/node/updateNode.operation.ts`
- **Dropdown Fields:**
  - `nodeId` dropdown ✅ (uses `getNodes` loadOptions method)
  - `locationId` dropdown ✅ (uses `getLocations` loadOptions method)
- **Why Not Tested:** Has dropdowns but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has multiple dropdowns that need testing

**22. Node → Delete**
- **File:** `actions/node/deleteNode.operation.ts`
- **Dropdown Fields:**
  - `nodeId` dropdown ✅ (uses `getNodes` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**23. Node → Get Configuration**
- **File:** `actions/node/getNodeConfiguration.operation.ts`
- **Dropdown Fields:**
  - `nodeId` dropdown ✅ (uses `getNodes` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**24. Node → Create Allocations**
- **File:** `actions/node/createNodeAllocations.operation.ts`
- **Dropdown Fields:**
  - `nodeId` dropdown ✅ (uses `getNodes` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**25. Node → Delete Allocation**
- **File:** `actions/node/deleteNodeAllocation.operation.ts`
- **Dropdown Fields:**
  - `nodeId` dropdown ✅ (uses `getNodes` loadOptions method)
  - `allocationId` dropdown ✅ **DEPENDENT** on nodeId (uses `getAvailableAllocations`)
- **Why Not Tested:** Has dependent dropdown but wasn't included in test workflow
- **Testing Priority:** 🔴 **CRITICAL** - Has dependent dropdown chain that needs testing

---

### ❌ Untested Nest Operations (1)

**26. Nest → List Eggs**
- **File:** `actions/nest/listNestEggs.operation.ts`
- **Dropdown Fields:**
  - `nestId` dropdown ✅ (uses `getNests` loadOptions method)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

---

### ❌ Untested Server Operations (9)

**27. Server → Get By External ID**
- **File:** `actions/server/getServerByExternalId.operation.ts`
- **Dropdown Fields:** None (uses externalId string input)
- **Why Not Tested:** No dropdowns to test
- **Testing Priority:** LOW (no dropdown functionality)

**28. Server → Create**
- **File:** `actions/server/createServer.operation.ts`
- **Dropdown Fields:**
  - `userId` dropdown ✅ (uses `getUsers`)
  - `nest` dropdown ✅ (uses `getNests`)
  - `egg` dropdown ✅ **DEPENDENT** on nest (uses `getEggsForNest`)
  - `dockerImage` dropdown ✅ **DEPENDENT** on nest + egg (uses `getDockerImagesForEgg`)
  - `nodeId` dropdown ✅ (uses `getNodes`)
  - `allocationId` dropdown ✅ **DEPENDENT** on nodeId (uses `getAvailableAllocations`)
- **Why Not Tested:** Has multiple dependent dropdowns but wasn't included in test workflow
- **Testing Priority:** 🔴 **CRITICAL** - Has complex multi-level dependent dropdown chains

**29. Server → Update Details**
- **File:** `actions/server/updateServerDetails.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
  - `userId` dropdown ✅ (uses `getUsers`)
- **Why Not Tested:** Has dropdowns but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has multiple dropdowns that need testing

**30. Server → Update Build**
- **File:** `actions/server/updateServerBuild.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**31. Server → Update Startup**
- **File:** `actions/server/updateServerStartup.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
  - `egg` dropdown ✅ (uses `getAllEggs`)
  - `dockerImage` dropdown ✅ **DEPENDENT** on egg (uses `getDockerImagesForEggById`)
- **Why Not Tested:** Has dependent dropdown but wasn't included in test workflow
- **Testing Priority:** 🔴 **CRITICAL** - Has dependent dropdown chain that needs testing

**32. Server → Suspend**
- **File:** `actions/server/suspendServer.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**33. Server → Unsuspend**
- **File:** `actions/server/unsuspendServer.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**34. Server → Reinstall**
- **File:** `actions/server/reinstallServer.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**35. Server → Delete**
- **File:** `actions/server/deleteServer.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

**36. Server → Force Delete**
- **File:** `actions/server/forceDeleteServer.operation.ts`
- **Dropdown Fields:**
  - `serverId` dropdown ✅ (uses `getServers`)
- **Why Not Tested:** Has dropdown but wasn't included in test workflow
- **Testing Priority:** ⚠️ **HIGH** - Has dropdown that needs testing

---

## Summary Statistics

### Total Application API Operations: 37

**Tested:** 9 operations (24%)
**Untested:** 28 operations (76%)

### Breakdown by Priority

#### 🔴 CRITICAL Priority (3 operations - Dependent Dropdowns)
1. **Server → Create**
   - Nest → Egg → Docker Image (3-level chain)
   - Node → Allocation (2-level chain)

2. **Server → Update Startup**
   - Egg → Docker Image (2-level chain)

3. **Node → Delete Allocation**
   - Node → Allocation (2-level chain)

#### ⚠️ HIGH Priority (22 operations - Simple Dropdowns)
**User Operations (2):**
- Update User
- Delete User

**Location Operations (2):**
- Update Location
- Delete Location

**Node Operations (5):**
- Create Node
- Update Node
- Delete Node
- Get Configuration
- Create Allocations

**Nest Operations (1):**
- List Eggs

**Server Operations (8):**
- Update Details
- Update Build
- Suspend
- Unsuspend
- Reinstall
- Delete
- Force Delete

#### LOW Priority (3 operations - No Dropdowns)
- User → Get By External ID
- User → Create
- Location → Create
- Server → Get By External ID

---

## Recommended Testing Additions

### Phase 1: Critical Dependent Dropdowns (MUST TEST)

Add these to the test workflow to verify dependent dropdown chains work correctly:

```json
// 1. Server → Create (Multi-level dependencies)
{
  "name": "App: Create Server (COMPLEX DEPENDENT)",
  "resource": "server",
  "operation": "create",
  "notes": "TEST: 1) Select User, 2) Select Nest → Egg dropdown populates, 3) Select Egg → Docker dropdown populates, 4) Select Node → Allocation dropdown populates"
}

// 2. Server → Update Startup (Dependent dropdown)
{
  "name": "App: Update Server Startup (DEPENDENT)",
  "resource": "server",
  "operation": "updateStartup",
  "notes": "TEST: 1) Select Server, 2) Select Egg → Docker Image dropdown populates"
}

// 3. Node → Delete Allocation (Dependent dropdown)
{
  "name": "App: Delete Allocation (DEPENDENT)",
  "resource": "node",
  "operation": "deleteAllocation",
  "notes": "TEST: 1) Select Node → Allocation dropdown populates, 2) Select Allocation"
}
```

### Phase 2: High Priority Simple Dropdowns

Add sample operations for each category:

```json
// User operations with dropdowns
{
  "name": "App: Update User (Dropdown)",
  "resource": "user",
  "operation": "update",
  "notes": "TEST: Select user from dropdown"
}

{
  "name": "App: Delete User (Dropdown)",
  "resource": "user",
  "operation": "delete",
  "notes": "TEST: Select user from dropdown"
}

// Location operations with dropdowns
{
  "name": "App: Update Location (Dropdown)",
  "resource": "location",
  "operation": "update",
  "notes": "TEST: Select location from dropdown"
}

// Node operations with dropdowns
{
  "name": "App: Create Node (Dropdown)",
  "resource": "node",
  "operation": "create",
  "notes": "TEST: Select location from dropdown"
}

{
  "name": "App: Update Node (Multi-Dropdown)",
  "resource": "node",
  "operation": "update",
  "notes": "TEST: Select node and location from dropdowns"
}

// Server operations with dropdowns
{
  "name": "App: Update Server Details (Multi-Dropdown)",
  "resource": "server",
  "operation": "updateDetails",
  "notes": "TEST: Select server and user from dropdowns"
}

{
  "name": "App: Suspend Server (Dropdown)",
  "resource": "server",
  "operation": "suspend",
  "notes": "TEST: Select server from dropdown"
}
```

---

## Operations Organized by Dropdown Type

### Independent Dropdowns (No Dependencies)

**User Dropdowns:**
- User → Update (userId)
- User → Delete (userId)

**Location Dropdowns:**
- Location → Update (locationId)
- Location → Delete (locationId)

**Node Dropdowns:**
- Node → Delete (nodeId)
- Node → Get Configuration (nodeId)
- Node → Create Allocations (nodeId)

**Nest Dropdowns:**
- Nest → List Eggs (nestId)

**Server Dropdowns:**
- Server → Update Build (serverId)
- Server → Suspend (serverId)
- Server → Unsuspend (serverId)
- Server → Reinstall (serverId)
- Server → Delete (serverId)
- Server → Force Delete (serverId)

### Multi-Field Independent Dropdowns

**Node → Create:**
- locationId dropdown (independent)

**Node → Update:**
- nodeId dropdown (independent)
- locationId dropdown (independent)

**Server → Update Details:**
- serverId dropdown (independent)
- userId dropdown (independent)

### Dependent Dropdowns (Single Level)

**Node → Delete Allocation:**
- nodeId (parent)
- allocationId (depends on nodeId)

**Nest → List Eggs:**
- nestId (parent, though operation lists all eggs for nest)

**Server → Update Startup:**
- serverId (independent)
- egg (independent)
- dockerImage (depends on egg)

### Dependent Dropdowns (Multi-Level)

**Server → Create:**
- userId (independent)
- nest (independent parent)
- egg (depends on nest)
- dockerImage (depends on nest + egg)
- nodeId (independent parent)
- allocationId (depends on nodeId)

---

## Testing Coverage Gap Analysis

### Current Coverage: 24% (9/37 operations)

**What's Missing:**
- ❌ **0%** of update operations tested (0/6)
- ❌ **0%** of delete operations tested (0/6)
- ❌ **0%** of create operations with dropdowns tested (0/2)
- ✅ **100%** of simple get operations tested (6/6)
- ✅ **100%** of list operations tested (5/5)
- ⚠️ **33%** of dependent dropdown operations tested (1/3)

### Recommended Enhanced Test Coverage: 76% minimum

**Priority breakdown:**
1. 🔴 Test all 3 CRITICAL dependent dropdown operations (Server→Create, Server→UpdateStartup, Node→DeleteAllocation)
2. ⚠️ Test at least 1 operation from each HIGH priority category (Update, Delete, Create with dropdowns)
3. Skip LOW priority operations (no dropdown functionality)

### Minimal Comprehensive Test

Add **minimum 8 more operations** to achieve good coverage:

1. Server → Create (CRITICAL - multi-level dependencies)
2. Server → Update Startup (CRITICAL - egg → docker)
3. Node → Delete Allocation (CRITICAL - node → allocation)
4. User → Update (HIGH - userId dropdown)
5. Location → Update (HIGH - locationId dropdown)
6. Node → Update (HIGH - multiple dropdowns)
7. Server → Update Details (HIGH - multiple dropdowns)
8. Server → Suspend (HIGH - serverId dropdown)

This would bring coverage to **17/37 = 46%** with all critical paths tested.

---

## Conclusion

The current test workflow covers **basic dropdown functionality** but misses:

1. 🔴 **Most importantly:** Complex dependent dropdown chains (Server→Create with 6 dropdowns!)
2. ⚠️ All update/delete operations that use dropdowns
3. ⚠️ Multi-dropdown operations (operations with 2+ independent dropdowns)

**Recommendation:** Add at minimum the 3 CRITICAL operations to verify dependent dropdown chains work correctly, especially the complex Server→Create operation with nested dependencies.
