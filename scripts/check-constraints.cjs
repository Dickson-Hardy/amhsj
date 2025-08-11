const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=');
        }
      }
    });
  }
}

loadEnv();
const sql = neon(process.env.DATABASE_URL);

async function checkConstraints() {
  try {
    console.log('🔍 Checking role constraints...');
    
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'users')
      AND contype = 'c';
    `;
    
    console.log('Check constraints:', JSON.stringify(constraints, null, 2));
    
    // Also check the actual column definition
    const columns = await sql`
      SELECT column_name, data_type, column_default, is_nullable, 
             check_clause
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `;
    
    console.log('Role column info:', JSON.stringify(columns, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkConstraints();
