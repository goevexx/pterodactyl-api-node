#!/bin/bash
set -e

echo "=== Restoring Root Admin for User ID 1 ==="

# Get MySQL container name
MYSQL_CONTAINER=$(docker ps --filter name=pterodactyl-mysql --format "{{.Names}}")

if [ -z "$MYSQL_CONTAINER" ]; then
    echo "ERROR: MySQL container not found"
    exit 1
fi

echo "MySQL container: $MYSQL_CONTAINER"

# Restore root admin privileges for user 1
echo "Executing SQL to restore root_admin..."
docker exec -i $MYSQL_CONTAINER mysql -upterodactyl -ppterodactyl_password panel <<EOF
UPDATE users SET root_admin = 1 WHERE id = 1;
SELECT id, username, email, root_admin FROM users WHERE id = 1;
EOF

echo ""
echo "✅ Root admin privileges restored for user ID 1!"
echo ""
echo "User details:"
docker exec -i $MYSQL_CONTAINER mysql -upterodactyl -ppterodactyl_password panel -e "SELECT id, username, email, root_admin FROM users WHERE id = 1;"
