import postgres from 'postgres';

// Use your actual DATABASE_URL from .env.local
const sql = postgres("postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require");

async function runMigration() {
  try {
    console.log('Running migration to add missing ORCID fields...');
    
    // Add ORCID-related columns
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_verified BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_access_token TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_refresh_token TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_profile JSONB`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_last_sync TIMESTAMP`;

    // Add other missing enhanced user fields if they don't already exist
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'pending'`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations JSONB`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS languages_spoken JSONB`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS research_interests JSONB`;

    console.log('Migration completed successfully!');
    
    // Update existing users to have proper defaults
    await sql`
      UPDATE users SET 
        orcid_verified = false,
        is_active = true,
        application_status = CASE 
          WHEN role = 'admin' THEN 'approved'
          WHEN role = 'author' THEN 'approved' 
          ELSE 'pending'
        END,
        profile_completeness = CASE
          WHEN name IS NOT NULL AND email IS NOT NULL AND affiliation IS NOT NULL THEN 60
          WHEN name IS NOT NULL AND email IS NOT NULL THEN 40
          ELSE 20
        END
      WHERE orcid_verified IS NULL OR is_active IS NULL OR application_status IS NULL
    `;

    // Create indexes for the new columns
    await sql`CREATE INDEX IF NOT EXISTS idx_users_orcid_verified ON users(orcid_verified)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_application_status ON users(application_status)`;

    console.log('Data updates and indexes created successfully!');
    
    // Verify the columns were added
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' 
      AND column_name LIKE '%orcid%'
      ORDER BY column_name
    `;
    
    console.log('\nORCID-related columns after migration:');
    columns.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  } finally {
    await sql.end();
  }
}

runMigration();
