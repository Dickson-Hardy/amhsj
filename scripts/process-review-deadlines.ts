// scripts/process-review-deadlines.ts

import { reviewDeadlineManager } from '../lib/review-deadline-manager'

/**
 * Scheduled script to process review invitation deadlines
 * This should be run daily via cron job or similar scheduler
 */
async function processReviewDeadlines() {
  console.log('🕒 Starting scheduled review deadline processing...')
  console.log('Time:', new Date().toISOString())
  
  try {
    const results = await reviewDeadlineManager.processDeadlines()
    
    console.log('\n📊 Processing Results:')
    console.log(`✉️  Reminders sent: ${results.remindersProcessed}`)
    console.log(`🚫 Withdrawals processed: ${results.withdrawalsProcessed}`)
    console.log(`❌ Errors encountered: ${results.errors.length}`)
    
    if (results.errors.length > 0) {
      console.log('\n🚨 Errors:')
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
    
    console.log('\n✅ Scheduled deadline processing completed successfully')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Fatal error during deadline processing:', error)
    process.exit(1)
  }
}

// Run if this script is executed directly
if (require.main === module) {
  processReviewDeadlines()
}

export { processReviewDeadlines }
