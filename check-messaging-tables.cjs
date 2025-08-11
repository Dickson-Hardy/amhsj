const { Client } = require('pg');

async function checkAndCreateTables() {
  // Using the database URL from .env.local
  const databaseUrl = "postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database...');
    
    // Check which tables exist
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nExisting tables:');
    const tableNames = existingTables.rows.map(row => row.table_name);
    tableNames.forEach(name => console.log(`  - ${name}`));
    
    // Required tables for messaging system
    const requiredTables = ['conversations', 'messages'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`\nMissing tables: ${missingTables.join(', ')}`);
      console.log('Creating missing tables...');
      
      // Create conversations table
      if (missingTables.includes('conversations')) {
        console.log('Creating conversations table...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS conversations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            subject TEXT NOT NULL,
            type TEXT NOT NULL,
            related_id UUID,
            related_title TEXT,
            participants JSONB,
            last_message_id UUID,
            last_activity TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
      }
      
      // Create messages table
      if (missingTables.includes('messages')) {
        console.log('Creating messages table...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID REFERENCES conversations(id),
            sender_id UUID REFERENCES users(id),
            content TEXT NOT NULL,
            attachments JSONB,
            is_read BOOLEAN DEFAULT FALSE,
            read_by JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
      }
      
      console.log('Missing tables created successfully!');
    } else {
      console.log('\nAll required tables exist.');
    }
    
    // Check conversations table columns if it exists
    if (tableNames.includes('conversations')) {
      console.log('\nChecking conversations table structure...');
      const convCols = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'conversations'
        ORDER BY column_name
      `);
      
      console.log('Conversations table columns:');
      convCols.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkAndCreateTables().catch(console.error);
