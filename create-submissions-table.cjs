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

async function addSubmissionsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    
    // Just create the submissions table
    const sql = `
    -- Create submissions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        author_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'technical_check', 'under_review', 'accepted', 'rejected')),
        status_history JSONB DEFAULT '[]'::jsonb,
        submitted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create index
    CREATE INDEX IF NOT EXISTS idx_submissions_article_id ON submissions(article_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_author_id ON submissions(author_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    `;
    
    console.log('Creating submissions table...');
    await pool.query(sql);
    
    console.log('✓ Submissions table created successfully!');
    
    // Verify the submissions table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'submissions'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Submissions table verified');
    } else {
      console.log('❌ Submissions table not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addSubmissionsTable().catch(console.error);
