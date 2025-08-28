import { logger } from "@/lib/logger";
import { sql } from './lib/db/index.ts';

(async () => {
  try {
    logger.info('Checking database schema...');
    const columns = await sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' order by column_name`;
    logger.info('Actual database columns:', columns.map(r => r.column_name));
    
    // Also check if specific problematic columns exist
    const orcidColumns = await sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name like '%orcid%'`;
    logger.info('ORCID-related columns:', orcidColumns.map(r => r.column_name));
    
  } catch (e) {
    logger.error('Error:', e.message);
    if (e.cause) {
      logger.error('Cause:', e.cause.message);
    }
  }
})();
