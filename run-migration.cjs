const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'scripts', 'migrations', 'add-orcid-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration to add missing ORCID fields...');
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    
    // Verify the columns were added
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' 
      AND column_name LIKE '%orcid%'
      ORDER BY column_name
    `);
    
    console.log('\nORCID-related columns after migration:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
