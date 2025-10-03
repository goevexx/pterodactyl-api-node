# User Onboarding

## Overview

This workflow automates the complete customer onboarding process for new Pterodactyl servers. When triggered by your billing or CRM system, it validates the server, creates setup directories, writes welcome documentation, provisions a database, saves credentials, and sends a welcome email with all necessary information. Perfect for hosting providers, game server companies, or any business automating customer provisioning.

## Prerequisites

- n8n instance (self-hosted or cloud) with publicly accessible webhook URL
- Pterodactyl Panel with API access
- Pterodactyl Client API credentials configured in n8n
- Email service or webhook endpoint for customer notifications
- Billing/CRM system that can trigger webhooks (optional)

## Setup Instructions

### 1. Import Workflow

1. Copy the contents of `workflow.json`
2. In n8n, go to **Workflows** → **Import from File**
3. Paste the JSON content and import

### 2. Configure Credentials

1. Open any **Pterodactyl node** (e.g., "Validate Server")
2. Select your Pterodactyl credentials
3. All Pterodactyl nodes will use the same credentials

### 3. Get Webhook URL

1. Click on the **Webhook Trigger** node
2. Copy the **Production URL** (e.g., `https://your-n8n.com/webhook/onboard-customer`)
3. Save this URL for billing system integration

### 4. Configure Email Service

1. Open **Send Welcome Email** node
2. Replace `https://your-webhook-url.com/send-welcome-email` with your email service endpoint

**Email Service Options:**
- **SendGrid**: Use SendGrid API webhook
- **Mailgun**: Use Mailgun API endpoint
- **SMTP**: Replace with n8n's **Send Email** node
- **Custom**: Your own email microservice

### 5. Update Panel URL

1. Open **Prepare Email Data** node
2. Replace `https://panel.example.com` with your actual Pterodactyl panel URL

### 6. Test the Workflow

Send a POST request to your webhook URL:

```bash
curl -X POST https://your-n8n.com/webhook/onboard-customer \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "test-server-123",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "server_type": "Minecraft Server",
    "plan_name": "Premium"
  }'
```

## Usage

### Webhook Payload Format

**Required fields:**
```json
{
  "server_id": "customer-server-id",
  "customer_name": "Customer Name",
  "customer_email": "customer@example.com"
}
```

**Optional fields:**
```json
{
  "server_type": "Game Server",
  "plan_name": "Standard"
}
```

**Complete Example:**
```json
{
  "server_id": "minecraft-prod-001",
  "customer_name": "Gaming Company LLC",
  "customer_email": "admin@gamingcompany.com",
  "server_type": "Minecraft Server",
  "plan_name": "Enterprise"
}
```

### Workflow Steps

1. **Webhook receives customer data** from billing/CRM system
2. **Extract customer information** (name, email, server ID, plan)
3. **Validate server exists** in Pterodactyl panel
4. **Create `/setup` folder** for documentation
5. **Write welcome file** with server details and getting started guide
6. **Provision database** with auto-generated credentials
7. **Write database credentials** to `/.env.database` file
8. **Prepare email data** with all provisioning details
9. **Send welcome email** to customer
10. **Respond to webhook** with success confirmation

### Generated Files

**`/setup/welcome.txt`:**
```
Welcome to Minecraft Server!

Customer: Gaming Company LLC
Plan: Enterprise
Server ID: minecraft-prod-001
Provisioned: 2025-10-03 16:00:00

========================================
GETTING STARTED
========================================

1. Your server has been provisioned and is ready to use
2. Database credentials are stored in /.env.database
3. Check /setup/readme.md for configuration instructions
4. Visit our support portal for additional help

========================================
IMPORTANT INFORMATION
========================================

- Server Name: mc-prod-001
- Server UUID: abc-123-def-456
- Memory Limit: 4096 MB
- Disk Limit: 10240 MB
- CPU Limit: 200%

========================================
NEXT STEPS
========================================

1. Configure your application using the database credentials
2. Upload your files via FTP or the file manager
3. Start your server from the control panel
4. Monitor resource usage in real-time

Thank you for choosing our hosting service!
```

**`/.env.database`:**
```
# Database Configuration
# Provisioned: 2025-10-03T16:00:00.000Z

DB_HOST=mysql.example.com
DB_PORT=3306
DB_DATABASE=db_minecraft_prod_001
DB_USERNAME=u123_abc456
DB_PASSWORD=SecureRandomPassword123!

# Connection String
DATABASE_URL=mysql://u123_abc456:SecureRandomPassword123!@mysql.example.com:3306/db_minecraft_prod_001
```

## Integration Examples

### WHMCS Integration

Add webhook to WHMCS product activation:

1. **Provisioning Modules** → **Custom Module**
2. **After Create** hook:

```php
<?php
function custommodule_CreateAccount($params) {
    $data = [
        'server_id' => $params['serviceid'],
        'customer_name' => $params['clientsdetails']['firstname'] . ' ' . $params['clientsdetails']['lastname'],
        'customer_email' => $params['clientsdetails']['email'],
        'server_type' => $params['configoption1'],
        'plan_name' => $params['productname']
    ];

    $ch = curl_init('https://your-n8n.com/webhook/onboard-customer');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    return 'success';
}
```

### Stripe Webhook Integration

Trigger onboarding after successful payment:

```javascript
// Stripe webhook handler
app.post('/stripe-webhook', async (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    await fetch('https://your-n8n.com/webhook/onboard-customer', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        server_id: session.metadata.server_id,
        customer_name: session.customer_details.name,
        customer_email: session.customer_details.email,
        plan_name: session.metadata.plan
      })
    });
  }

  res.json({received: true});
});
```

### WordPress WooCommerce Integration

Use WooCommerce webhooks:

1. **WooCommerce** → **Settings** → **Advanced** → **Webhooks**
2. Create webhook for "Order completed"
3. **Delivery URL**: Your n8n webhook URL
4. Add code to transform WooCommerce data:

```php
add_filter('woocommerce_webhook_payload', function($payload, $resource, $resource_id) {
    if ($resource === 'order') {
        $order = wc_get_order($resource_id);
        return [
            'server_id' => $order->get_meta('_server_id'),
            'customer_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            'customer_email' => $order->get_billing_email(),
            'plan_name' => $order->get_items()[0]->get_name()
        ];
    }
    return $payload;
}, 10, 3);
```

## Customization Guide

### Add More Setup Files

Create additional documentation files:

1. Add more **Write File** nodes after "Write Welcome File"
2. Create `setup/readme.md`, `setup/configuration.txt`, etc.

```markdown
# Configuration Guide

## Step 1: Upload Files
...

## Step 2: Configure Database
...
```

### Custom Welcome Message

Edit the **Write Welcome File** node's `fileContent` to match your branding:

```
=Welcome to {{ $node['Extract Customer Data'].json.server_type }}!

Dear {{ $node['Extract Customer Data'].json.customer_name }},

Thank you for choosing [YOUR COMPANY NAME]!

Your server is now ready...
```

### Install Default Plugins/Mods

Add file upload nodes to install default software:

1. Download plugin from URL
2. Write plugin file to server
3. Configure plugin settings

### Email Template Customization

Replace **Send Welcome Email** with **Send Email** node for rich HTML emails:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Welcome to {{ $json.server_name }}!</h1>
  <p>Hi {{ $json.customer_name }},</p>
  <p>Your {{ $json.plan_name }} server is ready!</p>

  <h2>Server Details</h2>
  <ul>
    <li>Server ID: {{ $json.server_id }}</li>
    <li>Control Panel: <a href="{{ $json.panel_url }}">Access Here</a></li>
  </ul>

  <h2>Database Credentials</h2>
  <table>
    <tr><td>Host:</td><td>{{ $json.database_host }}</td></tr>
    <tr><td>Port:</td><td>{{ $json.database_port }}</td></tr>
    <tr><td>Database:</td><td>{{ $json.database_name }}</td></tr>
    <tr><td>Username:</td><td>{{ $json.database_username }}</td></tr>
    <tr><td>Password:</td><td>{{ $json.database_password }}</td></tr>
  </table>
</body>
</html>
```

### Add CRM/Ticketing Integration

Create support ticket after onboarding:

1. Add **HTTP Request** node after "Send Welcome Email"
2. POST to ticketing system API:

```json
{
  "customer_email": "{{ $json.to }}",
  "subject": "Welcome to {{ $json.server_name }}",
  "message": "Automated welcome ticket",
  "priority": "low",
  "status": "open"
}
```

### Multi-Step Verification

Add verification steps:

1. **Wait** node (24 hours)
2. **Get Server Resources** to check if customer started server
3. Send follow-up email if server not started

## Expected Behavior

### Successful Onboarding

**Created Resources:**
- `/setup/` folder
- `/setup/welcome.txt` with getting started guide
- `/.env.database` with database credentials
- MySQL database provisioned

**Email Sent:**
Customer receives email with:
- Server access details
- Database credentials
- Control panel link
- Getting started instructions

**Webhook Response:**
```json
{
  "success": true,
  "message": "Customer onboarded successfully",
  "server_id": "minecraft-prod-001",
  "customer_email": "admin@gamingcompany.com",
  "database_provisioned": true
}
```

**Execution Time:** 10-15 seconds

## Troubleshooting

### Common Issues

**1. "Server not found" error**
- **Cause**: Server doesn't exist or invalid server ID
- **Solution**:
  - Ensure server is created in Pterodactyl first
  - Verify server ID matches exactly
  - Check API credentials have access to this server

**2. Email not sent**
- **Cause**: Email service endpoint unreachable or invalid
- **Solution**:
  - Test email endpoint independently
  - Check email service API credentials
  - Review n8n execution logs for HTTP errors

**3. Database already exists**
- **Cause**: Database name collision
- **Solution**:
  - Add uniqueness to database name (timestamp, UUID)
  - Check existing databases before creation
  - Delete old databases if onboarding is rerun

**4. Permission denied writing files**
- **Cause**: API key lacks file management permissions
- **Solution**: Verify Client API credentials have file write access

**5. Welcome file overwritten**
- **Cause**: Re-running onboarding for same server
- **Solution**:
  - Add check to see if `/setup/welcome.txt` exists
  - Skip file creation if already onboarded
  - Or append timestamp to file names

### Debugging Tips

1. **Test each step**: Click through each node to verify data flow
2. **Check server state**: Ensure server is in correct state (not "installing")
3. **Verify file creation**: Use Pterodactyl file manager to confirm files exist
4. **Test email payload**: Send test email independently
5. **Monitor webhooks**: Log all incoming webhook payloads

## Security Considerations

**1. Webhook Authentication**

Add authentication to prevent unauthorized onboarding:

```javascript
// Add Code node after Webhook Trigger
const apiKey = $input.item.headers['x-api-key'];
const validKey = 'your-secret-api-key';

if (apiKey !== validKey) {
  throw new Error('Unauthorized');
}

return items;
```

**2. Input Validation**

Validate customer data:

```javascript
// Validate email format
const email = $json.customer_email;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Invalid email');
}

// Validate server_id format
const serverId = $json.server_id;
if (!/^[a-z0-9-]+$/.test(serverId)) {
  throw new Error('Invalid server ID');
}

return items;
```

**3. Sensitive Data Handling**

- Store database passwords securely (already in encrypted `.env.database`)
- Use HTTPS for email transmission
- Consider encrypting emails with customer's PGP key

## Performance Considerations

- **Execution time**: 10-15 seconds per customer
- **Concurrent onboarding**: Workflow handles multiple customers simultaneously
- **Rate limiting**: Respects Pterodactyl API limits
- **Bulk onboarding**: For mass provisioning, add queue system

## Related Workflows

- **04-database-provisioning**: Standalone database creation
- **03-file-deployment-ci-cd**: Automated file deployment

## Extension Ideas

1. **Multi-server provisioning**: Create multiple servers per customer
2. **Automated backups**: Schedule first backup during onboarding
3. **Resource monitoring**: Set up monitoring alerts automatically
4. **Trial period management**: Auto-suspend after trial expires
5. **Onboarding progress tracking**: Send updates as each step completes
6. **Custom branding**: Generate branded welcome pages
7. **Training sequence**: Send series of tutorial emails over time
8. **Referral program**: Include referral code in welcome email
