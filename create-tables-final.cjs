const { Client } = require('pg')

async function createMissingTables() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  
  try {
    console.log('🔗 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully')

    // Create advertisements table
    console.log('📝 Creating advertisements table...')
    await client.query(`
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
        created_by UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Advertisements table created/verified')

    // Create reviewer_profiles table
    console.log('📝 Creating reviewer_profiles table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviewer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
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
    `)
    console.log('✅ Reviewer profiles table created/verified')

    // Create editor_profiles table
    console.log('📝 Creating editor_profiles table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS editor_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
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
    `)
    console.log('✅ Editor profiles table created/verified')

    // Add missing columns to users table
    console.log('📝 Adding missing columns to users table...')
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'pending'`)
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0`)
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`)
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations JSONB`)
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS languages_spoken JSONB`)
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS research_interests JSONB`)
      console.log('✅ User table columns updated')
    } catch (error) {
      console.log('⚠️  Some user columns may already exist:', error.message)
    }

    // Add DOI columns to articles table
    console.log('📝 Adding DOI columns to articles table...')
    try {
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS doi_registered BOOLEAN DEFAULT false`)
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS doi_registered_at TIMESTAMP`)
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS crossref_metadata JSONB`)
      console.log('✅ Articles table DOI columns updated')
    } catch (error) {
      console.log('⚠️  Some articles columns may already exist:', error.message)
    }

    console.log('🎉 Database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

createMissingTables()
