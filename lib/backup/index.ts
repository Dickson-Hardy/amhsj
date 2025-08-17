import { backupScheduler } from './scheduler'

// Initialize backup scheduler when the application starts
export function initializeBackupScheduler() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Initializing backup scheduler for production...')
    
    // The scheduler is automatically initialized when imported
    // Additional schedules can be added here if needed
    
    console.log('✅ Backup scheduler initialized')
    
    // Log active schedules
    const activeSchedules = backupScheduler.listActiveSchedules()
    console.log(`📅 Active backup schedules: ${activeSchedules.length}`)
    
    activeSchedules.forEach(schedule => {
      console.log(`   - ${schedule.id}: Next run at ${schedule.nextExecution}`)
    })
  } else {
    console.log('🔧 Backup scheduler disabled in development mode')
  }
}

// Export the scheduler for manual control
export { backupScheduler }
