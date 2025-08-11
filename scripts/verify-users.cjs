const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function checkUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Verifying database users...');
    console.log('');
    
    const result = await pool.query(`
      SELECT email, name, role, is_verified, application_status, 
             orcid, affiliation, profile_completeness
      FROM users 
      ORDER BY 
        CASE role 
          WHEN 'admin' THEN 1
          WHEN 'editor' THEN 2 
          WHEN 'reviewer' THEN 3
          WHEN 'author' THEN 4
          ELSE 5
        END, 
        email
    `);
    
    console.log('🎯 Current users in database:');
    console.log(''.padEnd(100, '='));
    console.log('Role       | Email                            | Name                     | Status   | Profile%');
    console.log(''.padEnd(100, '-'));
    
    result.rows.forEach(user => {
      const role = user.role.toUpperCase().padEnd(10);
      const email = user.email.padEnd(32);
      const name = user.name.padEnd(24);
      const status = user.application_status.padEnd(8);
      const profile = (user.profile_completeness || 0).toString().padEnd(3);
      
      console.log(`${role} | ${email} | ${name} | ${status} | ${profile}%`);
    });
    
    console.log(''.padEnd(100, '='));
    console.log(`📊 Total users: ${result.rows.length}`);
    console.log('');
    
    // Role distribution
    const roleCount = {};
    result.rows.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    console.log('📈 Role distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });
    
    console.log('');
    console.log('✅ Database verification complete!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();
