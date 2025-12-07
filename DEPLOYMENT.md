# Deployment Guide: Uncharted Ruins

This guide describes how to deploy "Uncharted Ruins" (formerly Lost City Surveyor) to a Linode VM with the domain `unchartedruins.online`.

## Prerequisites

1.  **Linode VM:** A standard Linode instance (e.g., Ubuntu 22.04 LTS).
2.  **Domain:** `unchartedruins.online` pointing to your Linode's IP address.

## Step 1: Server Setup (On your Linode VM)

SSH into your Linode server:
```bash
ssh root@<your-linode-ip>
```

Update and install dependencies (Node.js 20, Postgres, Nginx, Certbot):
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx (Web Server)
apt install -y nginx

# Install Certbot (for free SSL/HTTPS)
apt install -y certbot python3-certbot-nginx
```

## Step 2: Database Configuration

Switch to the postgres user and create the database:
```bash
sudo -u postgres psql
```

Inside the SQL prompt, run:
```sql
CREATE DATABASE uncharted_ruins;
CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE uncharted_ruins TO myuser;
\q
```
*(Replace `myuser` and `mypassword` with secure values).*

## Step 3: Application Setup

Clone your code or upload it to the server (e.g., to `/var/www/uncharted-ruins`).

Install dependencies and build the app:
```bash
cd /var/www/uncharted-ruins
npm install
npm run build
```

Create a `.env` file for production:
```bash
nano .env
```
Paste the following:
```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/uncharted_ruins
PORT=3000
NODE_ENV=production
```
*(Make sure to match the user/password you set in Step 2).*

Run database migrations:
```bash
npm run db:push
```

## Step 4: Run with PM2 (Process Manager)

Install PM2 to keep your app running forever:
```bash
npm install -g pm2
pm2 start dist/index.js --name "uncharted-ruins"
pm2 save
pm2 startup
```

## Step 5: Configure Nginx & SSL

Create a new Nginx config file:
```bash
nano /etc/nginx/sites-available/unchartedruins
```

Paste this configuration:
```nginx
server {
    server_name unchartedruins.online www.unchartedruins.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/unchartedruins /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## Step 6: Enable HTTPS (The "Green Lock")

Run Certbot to automatically configure SSL:
```bash
certbot --nginx -d unchartedruins.online -d www.unchartedruins.online
```
Follow the prompts (enter email, agree to terms).

## Final Verification
1.  Open `https://unchartedruins.online` on your phone.
2.  You should see the game loaded securely.
3.  You should see the "Install App" or "Add to Home Screen" prompt (or look for it in the browser menu).
