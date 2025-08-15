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

async function updateStatusDefinitions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    
    // Update submissions table statuses
    console.log('Updating submissions table...');
    await pool.query(`
      UPDATE submissions 
      SET status = 'technical_check' 
      WHERE status = 'under_review';
    `);
    
    await pool.query(`
      UPDATE submissions 
      SET status = 'under_review' 
      WHERE status = 'peer_review';
    `);
    
    // Update articles table statuses
    console.log('Updating articles table...');
    await pool.query(`
      UPDATE articles 
      SET status = 'technical_check' 
      WHERE status = 'under_review';
    `);
    
    await pool.query(`
      UPDATE articles 
      SET status = 'under_review' 
      WHERE status = 'peer_review';
    `);
    
    // Update reviews table if it exists
    console.log('Checking for reviews table...');
    const reviewsTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
      );
    `);
    
    if (reviewsTableExists.rows[0].exists) {
      console.log('Updating reviews table...');
      await pool.query(`
        UPDATE reviews 
        SET status = 'under_review' 
        WHERE status = 'peer_review';
      `);
    }
    
    // Update any status history in JSONB fields
    console.log('Updating status history...');
    await pool.query(`
      UPDATE submissions 
      SET status_history = (
        SELECT jsonb_agg(
          CASE 
            WHEN elem->>'status' = 'under_review' THEN jsonb_set(elem, '{status}', '"technical_check"')
            WHEN elem->>'status' = 'peer_review' THEN jsonb_set(elem, '{status}', '"under_review"')
            ELSE elem
          END
        )
        FROM jsonb_array_elements(status_history) elem
      )
      WHERE status_history IS NOT NULL 
      AND jsonb_array_length(status_history) > 0;
    `);
    
    // Update constraints if they exist
    console.log('Updating table constraints...');
    
    // Drop old constraints if they exist
    await pool.query(`
      ALTER TABLE submissions 
      DROP CONSTRAINT IF EXISTS submissions_status_check;
    `).catch(() => {
      console.log('No existing constraint to drop on submissions table');
    });
    
    await pool.query(`
      ALTER TABLE articles 
      DROP CONSTRAINT IF EXISTS articles_status_check;
    `).catch(() => {
      console.log('No existing constraint to drop on articles table');
    });
    
    // Add new constraints with updated status values
    await pool.query(`
      ALTER TABLE submissions 
      ADD CONSTRAINT submissions_status_check 
      CHECK (status IN ('draft', 'submitted', 'technical_check', 'under_review', 'revision_requested', 'revision_submitted', 'accepted', 'rejected', 'published', 'withdrawn'));
    `);
    
    await pool.query(`
      ALTER TABLE articles 
      ADD CONSTRAINT articles_status_check 
      CHECK (status IN ('draft', 'submitted', 'technical_check', 'under_review', 'revision_requested', 'revision_submitted', 'accepted', 'rejected', 'published', 'withdrawn'));
    `);
    
    console.log('✓ Status definitions updated successfully!');
    
    // Verify the changes
    console.log('\nVerifying updates...');
    const submissionCounts = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM submissions 
      GROUP BY status 
      ORDER BY status;
    `);
    
    const articleCounts = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM articles 
      GROUP BY status 
      ORDER BY status;
    `);
    
    console.log('\nSubmissions by status:');
    submissionCounts.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    console.log('\nArticles by status:');
    articleCounts.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('Error updating status definitions:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

updateStatusDefinitions().catch(console.error);
