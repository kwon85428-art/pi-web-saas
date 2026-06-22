#!/bin/bash
# ============================================================
# oil-web SaaS — Tencent Cloud deployment script
# ============================================================
# Usage:
#   1. Copy this repo to your Tencent Cloud server (CVM / Lighthouse)
#   2. Run: bash deploy.sh
#   3. Access: http://<your-ip>:30141
#
# For production with domain + HTTPS:
#   bash deploy.sh --production --domain your-domain.com
# ============================================================

set -e

DOMAIN=""
PRODUCTION=false
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

while [[ $# -gt 0 ]]; do
  case $1 in
    --production) PRODUCTION=true ;;
    --domain) DOMAIN="$2"; shift ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
  shift
done

echo "=== oil-web SaaS Deployment ==="
echo "Project dir: $PROJECT_DIR"
echo "Production mode: $PRODUCTION"
[[ -n "$DOMAIN" ]] && echo "Domain: $DOMAIN"

# ---- Check Node.js ----
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# ---- Install PM2 ----
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
fi

# ---- Install Nginx (production only) ----
if $PRODUCTION && ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  sudo apt-get update -qq
  sudo apt-get install -y nginx
fi

# ---- Install project dependencies ----
cd "$PROJECT_DIR"
echo "Installing npm dependencies..."
npm install --production

# ---- Generate JWT secret ----
if [[ ! -f .env ]]; then
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > .env << EOF
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=30141
# WECHAT_APP_ID=wx_your_app_id
# WECHAT_APP_SECRET=your_app_secret
# WECHAT_REDIRECT_URI=https://your-domain.com/api/auth/wechat
EOF
  echo "Generated .env with JWT_SECRET"
fi

# ---- Build Next.js ----
echo "Building Next.js..."
source .env 2>/dev/null || true
export JWT_SECRET="${JWT_SECRET:-oil-web-default}"
npm run build

# ---- PM2 ecosystem file ----
cat > ecosystem.config.cjs << PM2EOF
module.exports = {
  apps: [{
    name: 'oil-web',
    script: 'node_modules/.bin/next',
    args: 'start -p 30141',
    cwd: '$PROJECT_DIR',
    env: {
      NODE_ENV: 'production',
      PORT: '30141',
$(grep -E '^(JWT_SECRET|WECHAT_APP_ID|WECHAT_APP_SECRET|WECHAT_REDIRECT_URI)=' .env 2>/dev/null | sed 's/^/      /' || true)
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    restart_delay: 4000,
  }]
};
PM2EOF

# ---- Start/Restart ----
pm2 delete oil-web 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$(whoami)" --hp "$HOME" 2>/dev/null || true

echo ""
echo "=== Deployment Complete ==="
echo "App running on: http://localhost:30141"
echo ""
echo "Useful commands:"
echo "  pm2 status          — check status"
echo "  pm2 logs oil-web     — view logs"
echo "  pm2 restart oil-web  — restart"

# ---- Nginx config (production only) ----
if $PRODUCTION; then
  if [[ -z "$DOMAIN" ]]; then
    DOMAIN=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
  fi

  sudo tee /etc/nginx/sites-available/oil-web > /dev/null << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:30141;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
NGINXEOF

  sudo ln -sf /etc/nginx/sites-available/oil-web /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx

  echo ""
  echo "Nginx configured for: $DOMAIN"
  echo "Next step: set up SSL with certbot"
  echo "  sudo apt install -y certbot python3-certbot-nginx"
  echo "  sudo certbot --nginx -d $DOMAIN"
fi

echo ""
echo "=== Ready! ==="
