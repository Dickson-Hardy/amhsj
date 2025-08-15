const { Client } = require('pg');

async function createMonitoringEventsTable() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Create monitoring_events table
    console.log('📝 Creating monitoring_events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS monitoring_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'info',
        metadata JSONB DEFAULT '{}',
        user_id VARCHAR(255),
        resolved BOOLEAN DEFAULT false,
        resolved_by VARCHAR(255),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Monitoring events table created successfully');

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_monitoring_events_created_at ON monitoring_events(created_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_monitoring_events_severity ON monitoring_events(severity);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_monitoring_events_event_type ON monitoring_events(event_type);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_monitoring_events_resolved ON monitoring_events(resolved);
    `);

    console.log('✅ Indexes created successfully');
    console.log('🎉 Monitoring events table setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

createMonitoringEventsTable();
