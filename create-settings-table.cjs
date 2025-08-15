const { Client } = require('pg')

async function createSettingsTable() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  
  try {
    console.log('🔗 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully')

    // Create journal_settings table
    console.log('📝 Creating journal_settings table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        settings_data JSONB NOT NULL DEFAULT '{}',
        review_period_days INTEGER DEFAULT 21,
        minimum_reviewers INTEGER DEFAULT 2,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Journal settings table created/verified')

    // Insert default settings if not exists
    await client.query(`
      INSERT INTO journal_settings (id, settings_data, review_period_days, minimum_reviewers)
      VALUES ('default', '{}', 21, 2)
      ON CONFLICT (id) DO NOTHING
    `)
    console.log('✅ Default settings initialized')

    console.log('🎉 Settings table setup completed!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

createSettingsTable()
