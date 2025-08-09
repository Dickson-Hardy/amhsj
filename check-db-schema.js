import { sql } from './lib/db/index.ts';

(async () => {
  try {
    console.log('Checking database schema...');
    const columns = await sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' order by column_name`;
    console.log('Actual database columns:', columns.map(r => r.column_name));
    
    // Also check if specific problematic columns exist
    const orcidColumns = await sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name like '%orcid%'`;
    console.log('ORCID-related columns:', orcidColumns.map(r => r.column_name));
    
  } catch (e) {
    console.error('Error:', e.message);
    if (e.cause) {
      console.error('Cause:', e.cause.message);
    }
  }
})();
