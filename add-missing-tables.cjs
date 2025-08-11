const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function addMissingTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    
    // Read the script to add missing tables
    const scriptPath = path.join(__dirname, 'scripts', 'add-missing-tables.sql');
    const sql = fs.readFileSync(scriptPath, 'utf8');
    
    console.log('Adding missing tables...');
    await pool.query(sql);
    
    console.log('✓ Missing tables added successfully!');
    
    // Verify the submissions table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('submissions', 'user_applications', 'reviewer_profiles', 'editor_profiles')
      ORDER BY table_name
    `);
    
    console.log('\nVerified tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addMissingTables().catch(console.error);
