const { Client } = require('pg');

async function createAdminLogsTable() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Create admin_logs table
    console.log('📝 Creating admin_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        performed_by VARCHAR(255) NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('✅ admin_logs table created successfully');

    // Create index for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_logs_performed_by ON admin_logs(performed_by);
    `);

    console.log('✅ Indexes created successfully');
    console.log('🎉 Admin logs table setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

createAdminLogsTable();
