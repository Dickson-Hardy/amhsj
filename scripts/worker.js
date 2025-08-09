#!/usr/bin/env node

/**
 * AMHSJ Background Worker
 * Handles background tasks like email processing, report generation, and maintenance
 */

const { parentPort, workerData } = require('worker_threads');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Environment setup
require('dotenv').config({ path: '.env.production' });

// Import database and services
let db, emailService, monitoringService;

/**
 * Initialize worker services
 */
async function initializeServices() {
  try {
    // Import services (using dynamic imports for ES modules)
    const { db: database } = await import('./lib/db/index.js');
    const { EmailService } = await import('./lib/services/email.js');
    const { ProductionMonitoringService } = await import('./lib/services/production-monitoring.js');
    
    db = database;
    emailService = new EmailService();
    monitoringService = new ProductionMonitoringService();
    
    console.log('✓ Worker services initialized');
  } catch (error) {
    console.error('✗ Failed to initialize worker services:', error);
    process.exit(1);
  }
}

/**
 * Background Tasks
 */

// Email Queue Processor
async function processEmailQueue() {
  try {
    console.log('Processing email queue...');
    
    // Get pending emails from database
    const pendingEmails = await db.query(`
      SELECT * FROM email_queue 
      WHERE status = 'pending' 
      AND scheduled_at <= NOW() 
      ORDER BY priority DESC, created_at ASC 
      LIMIT 10
    `);
    
    for (const email of pendingEmails) {
      try {
        await emailService.sendEmail({
          to: email.recipient,
          subject: email.subject,
          html: email.html_content,
          text: email.text_content
        });
        
        // Mark as sent
        await db.query(`
          UPDATE email_queue 
          SET status = 'sent', sent_at = NOW() 
          WHERE id = ?
        `, [email.id]);
        
        console.log(`✓ Email sent to ${email.recipient}`);
      } catch (error) {
        console.error(`✗ Failed to send email to ${email.recipient}:`, error);
        
        // Mark as failed and increment retry count
        await db.query(`
          UPDATE email_queue 
          SET status = 'failed', retry_count = retry_count + 1, 
              last_error = ?, updated_at = NOW()
          WHERE id = ?
        `, [error.message, email.id]);
      }
    }
  } catch (error) {
    console.error('Email queue processing error:', error);
  }
}

// Database Cleanup
async function cleanupDatabase() {
  try {
    console.log('Running database cleanup...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    // Clean up old sessions
    await db.query(`
      DELETE FROM sessions 
      WHERE expires < ? OR created_at < ?
    `, [now, thirtyDaysAgo]);
    
    // Clean up old verification tokens
    await db.query(`
      DELETE FROM verification_tokens 
      WHERE expires < ?
    `, [now]);
    
    // Clean up old audit logs (keep 90 days)
    await db.query(`
      DELETE FROM audit_logs 
      WHERE created_at < ?
    `, [ninetyDaysAgo]);
    
    // Clean up processed email queue (keep 30 days)
    await db.query(`
      DELETE FROM email_queue 
      WHERE status IN ('sent', 'failed') 
      AND updated_at < ?
    `, [thirtyDaysAgo]);
    
    console.log('✓ Database cleanup completed');
  } catch (error) {
    console.error('Database cleanup error:', error);
  }
}

// Report Generation
async function generateReports() {
  try {
    console.log('Generating reports...');
    
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Daily submission report
    const submissionStats = await db.query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as new_submissions,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published
      FROM articles 
      WHERE DATE(created_at) = DATE(?)
    `, [yesterday]);
    
    // User activity report
    const userStats = await db.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_actions
      FROM audit_logs 
      WHERE DATE(created_at) = DATE(?)
    `, [yesterday]);
    
    // Generate report content
    const reportData = {
      date: yesterday.toISOString().split('T')[0],
      submissions: submissionStats[0],
      users: userStats[0],
      generated_at: new Date().toISOString()
    };
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'logs', 'reports', `daily-report-${reportData.date}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`✓ Daily report generated: ${reportPath}`);
    
    // Send report to monitoring service
    if (monitoringService) {
      await monitoringService.trackEvent('daily_report_generated', reportData);
    }
  } catch (error) {
    console.error('Report generation error:', error);
  }
}

// System Health Check
async function performHealthCheck() {
  try {
    console.log('Performing health check...');
    
    const healthData = {
      timestamp: new Date().toISOString(),
      services: {}
    };
    
    // Check database connection
    try {
      await db.query('SELECT 1');
      healthData.services.database = { status: 'healthy', response_time: 0 };
    } catch (error) {
      healthData.services.database = { status: 'unhealthy', error: error.message };
    }
    
    // Check Redis connection (if available)
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
          headers: {
            'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
          }
        });
        
        if (response.ok) {
          healthData.services.redis = { status: 'healthy', response_time: 0 };
        } else {
          healthData.services.redis = { status: 'unhealthy', error: 'Connection failed' };
        }
      }
    } catch (error) {
      healthData.services.redis = { status: 'unhealthy', error: error.message };
    }
    
    // Check external APIs
    const externalApis = [
      { name: 'orcid', url: 'https://orcid.org' },
      { name: 'crossref', url: 'https://api.crossref.org/works?rows=1' }
    ];
    
    for (const api of externalApis) {
      try {
        const startTime = Date.now();
        const response = await fetch(api.url, { timeout: 5000 });
        const responseTime = Date.now() - startTime;
        
        healthData.services[api.name] = {
          status: response.ok ? 'healthy' : 'degraded',
          response_time: responseTime
        };
      } catch (error) {
        healthData.services[api.name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    // Save health check data
    const healthPath = path.join(process.cwd(), 'logs', 'health', `health-${Date.now()}.json`);
    await fs.mkdir(path.dirname(healthPath), { recursive: true });
    await fs.writeFile(healthPath, JSON.stringify(healthData, null, 2));
    
    // Send to monitoring service
    if (monitoringService) {
      await monitoringService.trackEvent('health_check_completed', healthData);
    }
    
    console.log('✓ Health check completed');
  } catch (error) {
    console.error('Health check error:', error);
  }
}

// Log Rotation
async function rotateLogFiles() {
  try {
    console.log('Rotating log files...');
    
    const logsDir = path.join(process.cwd(), 'logs');
    const subdirs = ['app', 'access', 'error', 'security'];
    
    for (const subdir of subdirs) {
      const logDir = path.join(logsDir, subdir);
      
      try {
        const files = await fs.readdir(logDir);
        
        for (const file of files) {
          if (file.endsWith('.log')) {
            const filePath = path.join(logDir, file);
            const stats = await fs.stat(filePath);
            
            // Rotate if file is larger than 10MB
            if (stats.size > 10 * 1024 * 1024) {
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const newPath = path.join(logDir, `${file}.${timestamp}`);
              
              await fs.rename(filePath, newPath);
              await fs.writeFile(filePath, ''); // Create new empty log file
              
              console.log(`✓ Rotated log file: ${file}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error rotating logs in ${subdir}:`, error);
      }
    }
  } catch (error) {
    console.error('Log rotation error:', error);
  }
}

/**
 * Cron Job Scheduler
 */
function setupCronJobs() {
  console.log('Setting up cron jobs...');
  
  // Process email queue every minute
  cron.schedule('* * * * *', processEmailQueue);
  
  // Database cleanup daily at 2 AM
  cron.schedule('0 2 * * *', cleanupDatabase);
  
  // Generate reports daily at 6 AM
  cron.schedule('0 6 * * *', generateReports);
  
  // Health check every 5 minutes
  cron.schedule('*/5 * * * *', performHealthCheck);
  
  // Log rotation every hour
  cron.schedule('0 * * * *', rotateLogFiles);
  
  console.log('✓ Cron jobs scheduled');
}

/**
 * Worker Message Handler
 */
if (parentPort) {
  parentPort.on('message', async (message) => {
    try {
      switch (message.type) {
        case 'process_emails':
          await processEmailQueue();
          break;
        case 'cleanup_database':
          await cleanupDatabase();
          break;
        case 'generate_reports':
          await generateReports();
          break;
        case 'health_check':
          await performHealthCheck();
          break;
        case 'rotate_logs':
          await rotateLogFiles();
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
      
      parentPort.postMessage({ success: true, type: message.type });
    } catch (error) {
      console.error('Worker task error:', error);
      parentPort.postMessage({ success: false, type: message.type, error: error.message });
    }
  });
}

/**
 * Main Worker Function
 */
async function main() {
  console.log('🚀 AMHSJ Background Worker starting...');
  
  try {
    await initializeServices();
    setupCronJobs();
    
    console.log('✓ Background worker is running');
    
    // Keep the worker alive
    if (!parentPort) {
      // Running as standalone process
      process.on('SIGINT', () => {
        console.log('📴 Background worker shutting down...');
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        console.log('📴 Background worker shutting down...');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('✗ Worker initialization failed:', error);
    process.exit(1);
  }
}

// Start the worker
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  processEmailQueue,
  cleanupDatabase,
  generateReports,
  performHealthCheck,
  rotateLogFiles
};
