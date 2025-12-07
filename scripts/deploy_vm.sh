#!/bin/bash
set -e

# --- Configuration ---
DOMAIN="unchartedruins.online"
DB_USER="myuser"
DB_PASS="mypassword"
DB_NAME="uncharted_ruins"
APP_NAME="uncharted-ruins"
EMAIL="admin@unchartedruins.online"

echo "=== Starting Speed Deployment for $APP_NAME ==="

# 1. Install System Dependencies
echo "[1/8] Installing System Dependencies (Node 20, Postgres, Nginx)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
sudo apt-get update > /dev/null 2>&1
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx > /dev/null 2>&1

# 2. Setup Database
echo "[2/8] Configuring Database..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "  - Database already exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" 2>/dev/null || echo "  - User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" > /dev/null 2>&1

# 3. Setup Project Dependencies
echo "[3/8] Installing Project Dependencies..."
npm install

# 4. Build Project
echo "[4/8] Building App..."
npm run build

# 5. Environment Config
echo "[5/8] Creating Production Environment..."
cat > .env << EOL
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
PORT=3000
NODE_ENV=production
SESSION_SECRET=$(openssl rand -hex 32)
EOL

# 6. Database Migration
echo "[6/8] Running Database Migrations..."
npm run db:push

# 7. Start with PM2
echo "[7/8] Starting Process Manager..."
sudo npm install -g pm2 > /dev/null 2>&1
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start dist/index.cjs --name "$APP_NAME"
pm2 save
# Note: Skipping 'pm2 startup' automation as it requires human interaction often, but app is running now.

# 8. Nginx & SSL
echo "[8/8] Configuring Nginx & SSL..."
sudo cat > /etc/nginx/sites-available/$APP_NAME << EOL
server {
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Certbot might fail if DNS hasn't propagated, so we allow it to fail gracefully
echo "Requesting SSL Certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL || echo "WARNING: SSL Setup failed. DNS might not be ready. Run 'certbot --nginx' manually later."

echo "=== Deployment Complete! ==="
echo "Visit https://$DOMAIN"
