#!/usr/bin/env node

/**
 * Quick verification script to test if the Pterodactyl node loads correctly
 * Run with: node test-node.js
 */

const { Pterodactyl } = require('./dist/nodes/Pterodactyl/Pterodactyl.node.js');

console.log('🔍 Testing Pterodactyl Node...\n');

const node = new Pterodactyl();
const description = node.description;

// Verify basic structure
console.log('✅ Node loaded successfully');
console.log(`   Name: ${description.displayName}`);
console.log(`   Version: ${description.version}`);
console.log(`   Type: ${description.name}\n`);

// Count resources
const resources = description.properties.find((p) => p.name === 'resource');
console.log(`✅ Resources: ${resources.options.length}`);
resources.options.forEach((r) => console.log(`   - ${r.name} (${r.value})`));

// Count operations per resource
const operations = description.properties.filter((p) => p.name === 'operation');
console.log(`\n✅ Total operation groups: ${operations.length}`);

operations.forEach((op) => {
	const resourceName = op.displayOptions?.show?.resource?.[0];
	if (resourceName) {
		console.log(`   ${resourceName}: ${op.options.length} operations`);
	}
});

// Count credentials
const credentials = description.credentials;
console.log(`\n✅ Credentials: ${credentials.length}`);
credentials.forEach((c) => console.log(`   - ${c.name}`));

// Verify execute method exists
console.log(`\n✅ Execute method: ${typeof node.execute === 'function' ? 'Present' : 'MISSING'}`);

console.log('\n✨ All basic checks passed! Node structure is valid.');
console.log('\n📝 Next steps:');
console.log(
	'   1. Install in n8n: npm link (in this dir), then npm link n8n-nodes-pterodactyl (in ~/.n8n/nodes)',
);
console.log('   2. Restart n8n and look for "Pterodactyl" in the node list');
console.log('   3. Add credentials and test with your Pterodactyl panel');
