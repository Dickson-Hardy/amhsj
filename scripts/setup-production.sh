#!/bin/bash

# Production Configuration Setup Script
# This script sets up the production environment for AMHSJ

set -e

echo "🚀 Setting up AMHSJ Production Configuration..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root (for system configurations)
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Some configurations will be system-wide."
    fi
}

# Create production environment file
setup_production_env() {
    print_info "Setting up production environment variables..."
    
    if [ ! -f .env.production ]; then
        cp .env.local .env.production
        print_status "Created .env.production from .env.local"
    else
        print_warning ".env.production already exists, skipping..."
    fi

    # Add production-specific environment variables
    cat >> .env.production << EOF

# Production Environment Settings
NODE_ENV=production
ENABLE_REAL_APIS=true
ENABLE_MONITORING=true
ENABLE_ANALYTICS=true
ENABLE_SECURITY_HEADERS=true

# Production URLs
NEXT_PUBLIC_APP_URL=https://amhsj.org
NEXTAUTH_URL=https://amhsj.org

# Production Database (Update with your production DB)
# DATABASE_URL=postgresql://prod_user:prod_password@prod-db-host:5432/amhsj_prod

# Production Redis (Update with your production Redis)
# UPSTASH_REDIS_REST_URL=https://your-prod-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-prod-redis-token

# SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/amhsj.crt
SSL_KEY_PATH=/etc/ssl/private/amhsj.key

# Backup Configuration
BACKUP_S3_BUCKET=amhsj-backups
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# Rate Limiting (Production values)
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_REQUESTS_PER_HOUR=1000

# Security
ENABLE_CSRF_PROTECTION=true
ENABLE_RATE_LIMITING=true
CORS_ORIGIN=https://amhsj.org

EOF

    print_status "Added production environment variables"
}

# Setup SSL certificates directory
setup_ssl() {
    print_info "Setting up SSL certificate directories..."
    
    sudo mkdir -p /etc/ssl/certs /etc/ssl/private
    sudo chmod 755 /etc/ssl/certs
    sudo chmod 700 /etc/ssl/private
    
    # Create self-signed certificate for development (replace with real certs in production)
    if [ ! -f /etc/ssl/certs/amhsj.crt ]; then
        print_info "Creating self-signed certificate for development..."
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/ssl/private/amhsj.key \
            -out /etc/ssl/certs/amhsj.crt \
            -subj "/C=US/ST=State/L=City/O=AMHSJ/CN=amhsj.org"
        
        print_status "Self-signed certificate created"
        print_warning "Replace with real SSL certificate in production!"
    fi
}

# Setup logging directories
setup_logging() {
    print_info "Setting up logging directories..."
    
    mkdir -p logs/{app,access,error,security}
    chmod 755 logs
    chmod 644 logs/*
    
    # Create log rotation configuration
    cat > logrotate.conf << EOF
./logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

    print_status "Logging directories created"
}

# Setup backup directories
setup_backup() {
    print_info "Setting up backup configuration..."
    
    mkdir -p backups/{database,files,config}
    chmod 755 backups
    
    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# AMHSJ Backup Script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DB_BACKUP_FILE="$BACKUP_DIR/database/amhsj_$DATE.sql"

echo "Starting backup at $(date)"

# Database backup
if [ -n "$DATABASE_URL" ]; then
    echo "Backing up database..."
    pg_dump "$DATABASE_URL" > "$DB_BACKUP_FILE"
    gzip "$DB_BACKUP_FILE"
    echo "Database backup completed: $DB_BACKUP_FILE.gz"
fi

# Files backup
echo "Backing up uploaded files..."
tar -czf "$BACKUP_DIR/files/files_$DATE.tar.gz" public/uploads/ 2>/dev/null || true

# Configuration backup
echo "Backing up configuration..."
cp .env.production "$BACKUP_DIR/config/env_$DATE.backup"

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.backup" -mtime +30 -delete

echo "Backup completed at $(date)"
EOF

    chmod +x scripts/backup.sh
    print_status "Backup configuration created"
}

# Setup monitoring
setup_monitoring() {
    print_info "Setting up monitoring configuration..."
    
    # Create monitoring configuration
    cat > monitoring.json << EOF
{
  "healthChecks": {
    "interval": 60000,
    "timeout": 5000,
    "endpoints": [
      "/api/monitoring/health",
      "/api/health"
    ]
  },
  "alerts": {
    "email": "admin@amhsj.org",
    "slack": {
      "webhook": "",
      "channel": "#alerts"
    }
  },
  "metrics": {
    "retention": "30d",
    "aggregation": "1m"
  }
}
EOF

    print_status "Monitoring configuration created"
}

# Setup security configurations
setup_security() {
    print_info "Setting up security configurations..."
    
    # Create security headers configuration
    cat > security-headers.conf << EOF
# Security Headers for Nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';" always;
EOF

    print_status "Security headers configuration created"
}

# Setup systemd service (Linux only)
setup_systemd() {
    if [ "$(uname)" = "Linux" ] && command -v systemctl >/dev/null 2>&1; then
        print_info "Setting up systemd service..."
        
        cat > amhsj.service << EOF
[Unit]
Description=AMHSJ Journal Application
Documentation=https://amhsj.org
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
EnvironmentFile=$(pwd)/.env.production
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=5

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$(pwd)

[Install]
WantedBy=multi-user.target
EOF

        print_status "Systemd service file created (amhsj.service)"
        print_warning "Copy to /etc/systemd/system/ and enable with: sudo systemctl enable amhsj.service"
    fi
}

# Setup Docker production configuration
setup_docker_production() {
    print_info "Setting up Docker production configuration..."
    
    # Create production Docker Compose file
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups
    networks:
      - amhsj-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=amhsj_prod
      - POSTGRES_USER=\${POSTGRES_USER}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/database:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - amhsj-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - amhsj-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - amhsj-network

volumes:
  postgres_data:
  redis_data:

networks:
  amhsj-network:
    driver: bridge
EOF

    # Create production Dockerfile
    cat > Dockerfile.prod << EOF
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm install -g pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create logs directory
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

    print_status "Docker production configuration created"
}

# Setup production Nginx configuration
setup_nginx_prod() {
    print_info "Setting up production Nginx configuration..."
    
    cat > nginx.prod.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/s;

    # Upstream
    upstream app {
        server app:3000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name amhsj.org www.amhsj.org;
        return 301 https://\$server_name\$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name amhsj.org www.amhsj.org;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/amhsj.crt;
        ssl_certificate_key /etc/nginx/ssl/amhsj.key;
        ssl_session_timeout 1d;
        ssl_session_cache shared:MozTLS:10m;
        ssl_session_tickets off;

        # Modern configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security Headers
        include /etc/nginx/security-headers.conf;

        # API Rate Limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Static files
        location /_next/static/ {
            alias /app/.next/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Main application
        location / {
            limit_req zone=general burst=50 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://app;
            proxy_set_header Host \$host;
        }
    }
}
EOF

    print_status "Production Nginx configuration created"
}

# Main setup function
main() {
    print_info "Starting AMHSJ Production Configuration Setup"
    print_info "============================================="
    
    check_root
    
    # Create necessary directories
    mkdir -p scripts ssl logs backups
    
    # Run setup functions
    setup_production_env
    setup_ssl
    setup_logging
    setup_backup
    setup_monitoring
    setup_security
    setup_systemd
    setup_docker_production
    setup_nginx_prod
    
    print_info ""
    print_info "============================================="
    print_status "Production configuration setup completed!"
    print_info "============================================="
    print_info ""
    
    # Display next steps
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Update .env.production with your actual API keys and database URLs"
    echo "2. Replace self-signed certificates with real SSL certificates"
    echo "3. Configure your domain DNS to point to your server"
    echo "4. Set up database backups and monitoring"
    echo "5. Review and test all configurations before going live"
    echo ""
    echo -e "${YELLOW}Important Files Created:${NC}"
    echo "- .env.production (Environment variables)"
    echo "- docker-compose.prod.yml (Production Docker setup)"
    echo "- nginx.prod.conf (Nginx configuration)"
    echo "- scripts/backup.sh (Backup script)"
    echo "- monitoring.json (Monitoring configuration)"
    echo "- amhsj.service (Systemd service file)"
    echo ""
    echo -e "${GREEN}Production deployment ready! 🚀${NC}"
}

# Run main function
main "$@"
