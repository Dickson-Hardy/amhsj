#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { advertisements, userApplications } = require('./lib/db/schema')

async function createMissingTables() {
  try {
    logger.info('Creating missing database tables...')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    const sql = postgres(connectionString)
    const db = drizzle(sql)

    // Create advertisements table
    await sql`
      CREATE TABLE IF NOT EXISTS advertisements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        target_url TEXT,
        position TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        click_count INTEGER DEFAULT 0,
        impression_count INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    logger.info('✅ Advertisements table created/verified')

    // Verify user_applications table exists with correct schema
    await sql`
      CREATE TABLE IF NOT EXISTS user_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        requested_role TEXT NOT NULL,
        current_role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        application_data JSONB,
        review_notes TEXT,
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP,
        submitted_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    logger.info('✅ User applications table created/verified')

    // Create reviewer_profiles table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS reviewer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        availability_status TEXT DEFAULT 'available',
        max_reviews_per_month INTEGER DEFAULT 3,
        current_review_load INTEGER DEFAULT 0,
        average_review_time INTEGER,
        completed_reviews INTEGER DEFAULT 0,
        late_reviews INTEGER DEFAULT 0,
        quality_score INTEGER DEFAULT 0,
        last_review_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    logger.info('✅ Reviewer profiles table created/verified')

    // Create editor_profiles table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS editor_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        editor_type TEXT NOT NULL,
        assigned_sections JSONB,
        current_workload INTEGER DEFAULT 0,
        max_workload INTEGER DEFAULT 10,
        is_accepting_submissions BOOLEAN DEFAULT true,
        editorial_experience TEXT,
        start_date TIMESTAMP DEFAULT NOW(),
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    logger.info('✅ Editor profiles table created/verified')

    // Create missing columns if needed
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'pending'`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations JSONB`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS languages_spoken JSONB`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS research_interests JSONB`
      logger.info('✅ User table columns updated')
    } catch (error) {
      logger.info('⚠️  Some user columns may already exist')
    }

    await sql.end()
    logger.info('🎉 Database migration completed successfully!')
    
  } catch (error) {
    logger.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

createMissingTables()
