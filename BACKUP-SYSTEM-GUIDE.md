# Backup Management System

## Overview

The Academic Journal Research System (AJRS) includes a comprehensive backup management system that provides automated and manual backup capabilities for your journal data.

## Features

### 🔄 Backup Types
- **Database Backup**: PostgreSQL database dump with all submissions, users, reviews, and system data
- **Files Backup**: All uploaded files, documents, PDFs, and media assets
- **Full Backup**: Complete system backup including database and files with manifest file

### ☁️ Storage Options
- **Local Storage**: Store backups on the server filesystem
- **AWS S3**: Recommended cloud storage with versioning and lifecycle policies
- **Cloudinary**: Alternative cloud storage (better for images)

### ⏰ Automated Scheduling
- **Daily Backups**: Automatic database backups at 2:00 AM
- **Weekly Backups**: Full system backups every Sunday at 1:00 AM
- **Custom Schedules**: Configure your own backup frequency and timing

### 🔐 Security Features
- **Encryption**: AES-256 encryption for sensitive backup data
- **Compression**: Gzip compression to reduce backup file sizes
- **Access Control**: Admin-only access to backup operations
- **Audit Logging**: Complete activity logs for all backup operations

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file with the following variables:

```env
# AWS S3 Configuration (Recommended)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BACKUP_BUCKET=your-backup-bucket

# Cloudinary Configuration (Alternative)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
BACKUP_NOTIFICATION_EMAIL=admin@yourjournal.com

# Backup Settings
BACKUP_ENCRYPTION_KEY=your_32_character_key
LOCAL_BACKUP_PATH=./backups
```

### 2. Dependencies

The following packages are required and have been installed:

```bash
pnpm add aws-sdk cloudinary node-cron @types/node-cron nodemailer @types/nodemailer
```

### 3. PostgreSQL Tools

Ensure `pg_dump` and `psql` are available in your system PATH:

- **Windows**: Install PostgreSQL tools
- **Linux**: `sudo apt-get install postgresql-client`
- **macOS**: `brew install postgresql`

## Usage

### Admin Dashboard

Access the backup management system through the Admin Dashboard:

1. Navigate to `/admin`
2. Click on the "Backup Management" tab
3. Use the interface to:
   - Create immediate backups
   - Schedule automated backups
   - Download existing backups
   - Restore from backup files
   - View backup history

### API Endpoints

The backup system provides REST API endpoints:

- `POST /api/admin/backup/create` - Create a new backup
- `GET /api/admin/backup/create` - Get backup history
- `GET /api/admin/backup/download/[filename]` - Download backup file
- `POST /api/admin/backup/restore` - Restore from backup
- `GET /api/admin/backup/restore` - List available backups
- `POST /api/admin/backup/schedule` - Create backup schedule
- `GET /api/admin/backup/schedule` - List active schedules

## Best Practices

### 📅 Backup Strategy
- **Daily**: Database backups for data protection
- **Weekly**: Full system backups for comprehensive recovery
- **Monthly**: Long-term retention backups
- **Pre-Update**: Manual backups before major system updates

### 🔒 Security Recommendations
1. Use IAM roles with minimal required permissions for AWS S3
2. Encrypt backups both in transit and at rest
3. Store encryption keys separately from backup files
4. Regularly test backup restoration procedures
5. Implement backup file integrity verification
6. Monitor backup job success/failure with alerts

### 💾 Retention Policy
- **Daily backups**: Keep for 7 days
- **Weekly backups**: Keep for 1 month
- **Monthly backups**: Keep for 1 year
- **Yearly backups**: Keep indefinitely

### 🚨 Disaster Recovery
1. Store backups in multiple locations (local + cloud)
2. Test restoration procedures regularly
3. Document recovery steps for your team
4. Consider cross-region backup replication
5. Maintain offline copies of critical data

## Monitoring and Alerts

### Backup Status Monitoring
- Email notifications for backup success/failure
- Admin dashboard shows last backup status
- System logs track all backup activities
- Real-time backup job progress indicators

### Failure Alerts
- Immediate email alerts for backup failures
- Dashboard notifications for overdue backups
- System health checks include backup status
- Automated retry mechanisms for transient failures

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure backup directories have write permissions
   - Check AWS S3 IAM permissions
   - Verify PostgreSQL connection credentials

2. **Storage Space**
   - Monitor backup file sizes
   - Implement retention policies
   - Use compression to reduce storage usage

3. **Network Issues**
   - Check internet connectivity for cloud uploads
   - Verify firewall settings for SMTP notifications
   - Test cloud storage credentials

### Log Files
- Backup activities are logged in the admin_logs table
- Check system console for scheduler output
- Review email delivery logs for notifications

## Support

For technical support or questions about the backup system:
- Check the system logs in Admin Dashboard > Backup > History
- Review environment configuration
- Test individual components (database connection, cloud storage, email)
- Contact your system administrator for server-level issues

## Version History

- **v1.0**: Initial backup system implementation
- **v1.1**: Added automated scheduling with node-cron
- **v1.2**: Enhanced security with encryption and access controls
- **v1.3**: Added multi-cloud storage support
