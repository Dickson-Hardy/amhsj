const { Client } = require('pg')

async function checkAndFixTableColumns() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  
  try {
    await client.connect()
    console.log('Connected to database')

    // Check users table columns
    const usersColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' ORDER BY column_name
    `)
    console.log('Users table columns:', usersColumns.rows.map(r => r.column_name))

    // Check if users table has all required columns from schema
    const requiredUserColumns = [
      'id', 'email', 'name', 'password', 'role', 'affiliation', 'orcid', 
      'orcid_verified', 'orcid_access_token', 'orcid_refresh_token', 'orcid_profile', 
      'orcid_last_sync', 'bio', 'expertise', 'is_verified', 'email_verification_token',
      'password_reset_token', 'password_reset_expires', 'is_active', 'application_status',
      'profile_completeness', 'last_active_at', 'specializations', 'languages_spoken',
      'research_interests', 'created_at', 'updated_at'
    ]

    const existingUserColumns = usersColumns.rows.map(r => r.column_name)
    const missingUserColumns = requiredUserColumns.filter(col => !existingUserColumns.includes(col))
    
    if (missingUserColumns.length > 0) {
      console.log('Missing columns in users table:', missingUserColumns)
      
      // Add missing columns one by one
      for (const column of missingUserColumns) {
        let columnDef = ''
        switch (column) {
          case 'orcid_verified':
            columnDef = 'orcid_verified BOOLEAN DEFAULT FALSE'
            break
          case 'orcid_access_token':
            columnDef = 'orcid_access_token TEXT'
            break
          case 'orcid_refresh_token':
            columnDef = 'orcid_refresh_token TEXT'
            break
          case 'orcid_profile':
            columnDef = 'orcid_profile JSONB'
            break
          case 'orcid_last_sync':
            columnDef = 'orcid_last_sync TIMESTAMP WITH TIME ZONE'
            break
          case 'bio':
            columnDef = 'bio TEXT'
            break
          case 'expertise':
            columnDef = 'expertise JSONB'
            break
          case 'email_verification_token':
            columnDef = 'email_verification_token TEXT'
            break
          case 'password_reset_token':
            columnDef = 'password_reset_token TEXT'
            break
          case 'password_reset_expires':
            columnDef = 'password_reset_expires TIMESTAMP WITH TIME ZONE'
            break
          case 'application_status':
            columnDef = 'application_status TEXT DEFAULT \'pending\''
            break
          case 'profile_completeness':
            columnDef = 'profile_completeness INTEGER DEFAULT 0'
            break
          case 'last_active_at':
            columnDef = 'last_active_at TIMESTAMP WITH TIME ZONE'
            break
          case 'specializations':
            columnDef = 'specializations JSONB'
            break
          case 'languages_spoken':
            columnDef = 'languages_spoken JSONB'
            break
          case 'research_interests':
            columnDef = 'research_interests JSONB'
            break
          default:
            console.log(`Skipping unknown column: ${column}`)
            continue
        }
        
        if (columnDef) {
          try {
            await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${columnDef}`)
            console.log(`✓ Added column: ${column}`)
          } catch (error) {
            console.log(`✗ Failed to add column ${column}:`, error.message)
          }
        }
      }
    } else {
      console.log('✓ Users table has all required columns')
    }

    // Check page_views table and add missing columns
    const pageViewsColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'page_views' ORDER BY column_name
    `)
    
    const existingPageViewsColumns = pageViewsColumns.rows.map(r => r.column_name)
    const requiredPageViewsColumns = ['time_on_page']
    const missingPageViewsColumns = requiredPageViewsColumns.filter(col => !existingPageViewsColumns.includes(col))
    
    if (missingPageViewsColumns.length > 0) {
      console.log('Adding missing columns to page_views table:', missingPageViewsColumns)
      
      for (const column of missingPageViewsColumns) {
        if (column === 'time_on_page') {
          await client.query(`ALTER TABLE page_views ADD COLUMN IF NOT EXISTS time_on_page INTEGER`)
          console.log(`✓ Added column: ${column}`)
        }
      }
    }

    console.log('Database schema check and fix completed!')

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

checkAndFixTableColumns()
