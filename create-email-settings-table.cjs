const { Client } = require('pg');

async function createEmailSettingsTable() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Create email_settings table
    console.log('📝 Creating email_settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        submission_confirmations BOOLEAN DEFAULT true,
        review_assignments BOOLEAN DEFAULT true,
        publication_notifications BOOLEAN DEFAULT true,
        reviewer_reminders BOOLEAN DEFAULT true,
        author_notifications BOOLEAN DEFAULT true,
        editor_notifications BOOLEAN DEFAULT true,
        deadline_reminders BOOLEAN DEFAULT true,
        smtp_server VARCHAR(255),
        smtp_port INTEGER,
        smtp_username VARCHAR(255),
        smtp_password VARCHAR(255),
        from_email VARCHAR(255),
        from_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Email settings table created successfully');

    // Insert default settings if not exists
    await client.query(`
      INSERT INTO email_settings (
        id, 
        submission_confirmations, 
        review_assignments, 
        publication_notifications,
        reviewer_reminders,
        author_notifications,
        editor_notifications,
        deadline_reminders,
        from_email,
        from_name
      )
      VALUES (
        'default', 
        true, 
        true, 
        true,
        true,
        true,
        true,
        true,
        'noreply@amjhs.com',
        'Academic Medical Journal of Health Sciences'
      )
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Default email settings initialized');
    console.log('🎉 Email settings table setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

createEmailSettingsTable();
