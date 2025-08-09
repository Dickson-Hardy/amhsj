# AMHSJ Production Deployment Guide

## 🚀 Deployment Options

### Vercel (Recommended)
For detailed Vercel deployment instructions, see [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

**Quick Vercel Deploy:**
```bash
# Setup (first time)
./deploy-vercel.sh production setup

# Deploy
./deploy-vercel.sh production deploy

# Windows
.\deploy-vercel.ps1 production deploy
```

### Docker/Self-Hosted
For traditional server deployment with Docker containers.

## 📋 Production Setup Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` and update all values
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Configure database credentials
- [ ] Set up email SMTP settings
- [ ] Configure AWS S3 for file uploads
- [ ] Add external API keys (CrossRef, ORCID, etc.)

### 2. SSL Certificates
```bash
# Create SSL directory
mkdir -p ssl

# Add your certificates
cp your-certificate.crt ssl/certificate.crt
cp your-private-key.key ssl/private.key
```

### 3. Domain Configuration
Update these files with your domain:
- `nginx.prod.conf`: Replace `yourdomain.com`
- `.env.production`: Set `NEXTAUTH_URL`

### 4. Database Setup
```bash
# Create database backup directory
mkdir -p backups

# Initialize database (first time only)
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## 🔧 Maintenance Mode

### Enable Maintenance
```bash
# Linux/macOS
./deploy.sh production maintenance-on

# Windows
.\deploy.ps1 production maintenance-on
```

### Disable Maintenance
```bash
# Linux/macOS
./deploy.sh production maintenance-off

# Windows
.\deploy.ps1 production maintenance-off
```

## 📊 Monitoring

### Access Monitoring Dashboard
- Prometheus: `http://your-server:9090`
- Application metrics: `http://your-server:3000/api/metrics`

### Health Checks
```bash
# Check application health
curl http://your-server:3000/api/health

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Updates and Rollbacks

### Update Application
```bash
git pull origin main
./deploy.sh production deploy
```

### Rollback
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker-compose -f docker-compose.prod.yml exec postgres psql -U $POSTGRES_USER -d amhsj < backups/db_backup_YYYYMMDD_HHMMSS.sql

# Start previous version
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ Security Considerations

### Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### Regular Backups
```bash
# Manual backup
./deploy.sh production backup

# Set up automated backups (crontab)
0 2 * * * /path/to/amhsj/deploy.sh production backup
```

## 🔍 Troubleshooting

### Check Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs app

# Database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

### Common Issues

#### 1. Application Won't Start
- Check environment variables in `.env.production`
- Verify database connectivity
- Check available disk space and memory

#### 2. SSL Certificate Issues
- Verify certificate files exist in `ssl/` directory
- Check certificate validity: `openssl x509 -in ssl/certificate.crt -text -noout`
- Ensure private key matches certificate

#### 3. Database Connection Errors
- Verify PostgreSQL container is running
- Check database credentials
- Ensure database exists

#### 4. High Memory Usage
- Monitor with: `docker stats`
- Adjust container memory limits in `docker-compose.prod.yml`
- Consider upgrading server resources

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_reviews_article_id ON reviews(article_id);
CREATE INDEX idx_users_email ON users(email);
```

### Nginx Optimization
- Enable gzip compression (already configured)
- Set up CDN for static assets
- Configure browser caching headers

### Application Optimization
- Monitor API response times via `/api/metrics`
- Use Redis caching for frequently accessed data
- Optimize database queries

## 🆘 Emergency Procedures

### Quick Maintenance Mode
```bash
# Immediate maintenance (bypass deployment script)
docker-compose -f docker-compose.prod.yml exec nginx touch /tmp/maintenance_mode
```

### Emergency Shutdown
```bash
docker-compose -f docker-compose.prod.yml down
```

### Emergency Backup
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $POSTGRES_USER amhsj > emergency_backup.sql
```

## 📞 Support Contacts

- Technical Issues: technical@amhsj.org
- Server Issues: infrastructure@amhsj.org
- Emergency: emergency@amhsj.org

---

Last Updated: $(date)
Version: 1.0.0
