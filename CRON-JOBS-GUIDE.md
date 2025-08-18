# AMHSJ Cron Jobs & Scheduled Tasks

## Overview
This document outlines all scheduled tasks and cron jobs in the AMHSJ (Advances in Medicine & Health Sciences Journal) system, optimized for Vercel's free tier limitations.

## Vercel Free Tier Configuration

### Single Consolidated Cron Job
Due to Vercel's free tier limitations (1 cron job maximum), all scheduled tasks are consolidated into a single comprehensive maintenance job.

**Endpoint**: `/api/cron/maintenance`  
**Schedule**: `0 2 * * *` (Daily at 2:00 AM UTC)  
**Environment Variable Required**: `CRON_SECRET`

### Tasks Performed

#### 1. Database Cleanup 🧹
- **Old Notifications**: Removes read notifications older than 30 days
- **Admin Logs**: Removes non-critical logs older than 90 days (keeps security alerts)
- **Expired Invitations**: Removes expired review invitations older than 1 year

#### 2. Email Queue Processing 📧
- Processes pending email queue items
- Handles retry logic for failed emails
- Maintains email delivery statistics

#### 3. Review Deadline Management ⏰
- **First Reminders**: Sends reminders 7 days before review deadline
- **Expiration**: Automatically expires overdue review invitations
- **Notification**: Emails reviewers about approaching deadlines

#### 4. User Activity Cleanup 👤
- **Inactive Users**: Marks users inactive after 6 months of no activity
- **Unverified Users**: Removes unverified accounts after 30 days

#### 5. Weekly Digest Generation 📊 (Mondays Only)
- Generates system statistics
- Sends weekly summary to administrators
- Includes submission counts, published articles, and active reviews

#### 6. System Health Check 🏥
- Tests database connectivity
- Validates email service configuration
- Checks storage service availability
- Reports system status

## Environment Variables

### Required
```bash
CRON_SECRET=your-secure-secret-token
```

### Email Configuration
```bash
RESEND_API_KEY=your-resend-key
# OR
SMTP_HOST=smtp.yourdomain.com
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
```

### Storage Configuration
```bash
CLOUDINARY_URL=cloudinary://...
# OR
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

## Security

### Authentication
All cron endpoints require the `CRON_SECRET` token in the Authorization header:
```
Authorization: Bearer your-cron-secret-token
```

### Error Handling
- All tasks include comprehensive error handling
- Failed operations are logged but don't stop other tasks
- System continues operation even if individual tasks fail

## Monitoring & Logging

### Admin Logs
All maintenance activities are logged to the `admin_logs` table with:
- Action performed
- Execution time
- Results summary
- Error details (if any)

### Console Output
Detailed console logging for debugging:
```
🔧 Starting daily maintenance tasks...
📊 Running database cleanup...
📧 Processing email queue...
⏰ Managing review deadlines...
👤 Cleaning user activity...
📊 Generating weekly digest... (Mondays only)
🏥 Performing health check...
✅ Daily maintenance completed in 1234ms
```

## Manual Testing

### Local Testing
```bash
# Test the maintenance endpoint locally
curl -X GET "http://localhost:3000/api/cron/maintenance" \
  -H "Authorization: Bearer your-cron-secret"
```

### Production Testing
```bash
# Test on Vercel deployment
curl -X GET "https://your-domain.vercel.app/api/cron/maintenance" \
  -H "Authorization: Bearer your-cron-secret"
```

## Performance Optimization

### Execution Time Limits
- Vercel function timeout: 30 seconds (configured in vercel.json)
- Tasks are optimized to complete within this limit
- Heavy operations are batched and limited

### Database Query Optimization
- Uses indexed columns for cleanup operations
- Limits result sets to prevent timeouts
- Implements efficient date-based filtering

### Memory Management
- Processes items in small batches
- Avoids loading large datasets into memory
- Implements streaming where possible

## Alternative Implementations

### PM2 Background Workers
For non-Vercel deployments, the system includes PM2 worker processes:

**Location**: `scripts/worker.js`  
**Processes**: 
- Email queue processor (every minute)
- Database cleanup (daily at 2 AM)
- Report generation (daily at 6 AM)
- Health checks (every 5 minutes)
- Log rotation (hourly)

### Backup Scheduler
**Location**: `lib/backup/scheduler.ts`  
**Jobs**:
- Daily database backup (2 AM)
- Weekly full backup (Sunday 1 AM)

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error
- Check `CRON_SECRET` environment variable
- Verify Authorization header format
- Ensure token matches exactly

#### 2. Database Connection Failures
- Verify database credentials
- Check connection string format
- Monitor connection pool limits

#### 3. Email Delivery Issues
- Validate email service configuration
- Check API key/SMTP credentials
- Monitor rate limiting

#### 4. Timeout Errors
- Review execution time logs
- Consider reducing batch sizes
- Optimize database queries

### Debugging

#### Enable Debug Logging
```bash
DEBUG=1 # Add to environment variables
```

#### Monitor Execution
Check the admin logs table for detailed execution reports:
```sql
SELECT * FROM admin_logs 
WHERE action LIKE '%Maintenance%' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Future Enhancements

### Possible Improvements
1. **Dynamic Scheduling**: Adjust frequency based on system load
2. **Priority Queues**: Process critical tasks first
3. **Distributed Processing**: Split tasks across multiple functions
4. **Real-time Monitoring**: Dashboard for cron job status
5. **Automatic Scaling**: Adjust batch sizes based on data volume

### Vercel Pro Benefits
With Vercel Pro plan:
- Multiple cron jobs allowed
- Longer execution timeouts
- Better monitoring tools
- Higher rate limits

## Support

For issues with cron jobs:
1. Check the admin logs for error details
2. Review console output in Vercel dashboard
3. Test manually using the curl commands above
4. Contact system administrator with specific error messages

---

**Last Updated**: August 18, 2025  
**Version**: 1.0  
**Maintainer**: AMHSJ Development Team