#!/bin/ash
set -e

echo "[Panel Startup Fix] Applying WSL2 io.weight fix..."

# Fix Panel validation to allow io=0
echo "[Panel Startup Fix] Modifying Server model validation..."
sed -i "s/'io' => 'required|numeric|between:10,1000',/'io' => 'required|numeric|min:0|max:1000',/" \
  /app/app/Models/Server.php

# Verify the change
if grep -q "'io' => 'required|numeric|min:0|max:1000'," /app/app/Models/Server.php; then
    echo "[Panel Startup Fix] ✓ Validation updated successfully"
else
    echo "[Panel Startup Fix] ✗ Validation update failed"
fi

# Wait for MySQL to be ready
echo "[Panel Startup Fix] Waiting for MySQL to be ready..."
until php -r "
try {
    \$pdo = new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');
    exit(0);
} catch (PDOException \$e) {
    exit(1);
}
" 2>/dev/null; do
    sleep 2
done
echo "[Panel Startup Fix] ✓ MySQL is ready"

# Create database trigger to auto-set io=0 on new servers
echo "[Panel Startup Fix] Creating database trigger for io.weight..."
php -r "
try {
    \$pdo = new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Drop existing trigger
    \$pdo->exec('DROP TRIGGER IF EXISTS fix_io_weight_on_insert');

    // Create new trigger
    \$sql = \"CREATE TRIGGER fix_io_weight_on_insert
BEFORE INSERT ON servers
FOR EACH ROW
BEGIN
    SET NEW.io = 0;
END\";

    \$pdo->exec(\$sql);
    echo 'Trigger created successfully' . PHP_EOL;
    exit(0);
} catch (PDOException \$e) {
    fwrite(STDERR, 'Error: ' . \$e->getMessage() . PHP_EOL);
    exit(1);
}
"

if [ $? -eq 0 ]; then
    echo "[Panel Startup Fix] ✓ Database trigger created successfully"
else
    echo "[Panel Startup Fix] ✗ Database trigger creation failed"
fi

# Fix any existing servers
echo "[Panel Startup Fix] Updating existing servers to io=0..."
php -r "
try {
    \$pdo = new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');
    \$pdo->exec('UPDATE servers SET io = 0');
} catch (PDOException \$e) {
    // Silent fail
}
" 2>/dev/null || true

echo "[Panel Startup Fix] All fixes applied successfully!"

# Execute the original Panel entrypoint
exec /bin/ash .github/docker/entrypoint.sh "$@"
