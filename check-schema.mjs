import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require"
});

(async () => {
  try {
    console.log('Checking database schema...');
    const columns = await sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' order by column_name`;
    console.log('Actual database columns:');
    columns.forEach(r => console.log('  -', r.column_name));
    
    // Also check if specific problematic columns exist
    const orcidColumns = await sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name like '%orcid%'`;
    console.log('\nORCID-related columns:');
    orcidColumns.forEach(r => console.log('  -', r.column_name));
    
    console.log('\nChecking if users table exists...');
    const tableExists = await sql`select 1 from information_schema.tables where table_schema = 'public' and table_name = 'users'`;
    console.log('Users table exists:', tableExists.length > 0);
    
  } catch (e) {
    console.error('Error:', e.message);
    if (e.cause) {
      console.error('Cause:', e.cause.message);
    }
  } finally {
    await sql.end();
  }
})();
