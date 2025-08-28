const { Client } = require('pg');

async function testMessagingSystem() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    logger.info('Connected to database...');
    
    // Check if conversations table exists and has data
    const conversations = await client.query('SELECT COUNT(*) FROM conversations');
    logger.info('Conversations count:', conversations.rows[0].count);
    
    // Check if messages table exists and has data
    const messages = await client.query('SELECT COUNT(*) FROM messages');
    logger.info('Messages count:', messages.rows[0].count);
    
    // Check users
    const users = await client.query('SELECT COUNT(*) FROM users');
    logger.info('Users count:', users.rows[0].count);
    
    // Get a sample user for testing
    const sampleUser = await client.query('SELECT id, name, email, role FROM users LIMIT 1');
    
    if (sampleUser.rows.length > 0) {
      const user = sampleUser.rows[0];
      logger.info('Sample user:', user);
      
      // Create a test conversation if none exist
      if (parseInt(conversations.rows[0].count) === 0) {
        logger.info('Creating test conversation...');
        const result = await client.query(`
          INSERT INTO conversations (subject, type, participants, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING id
        `, [
          'Test Conversation',
          'editorial',
          JSON.stringify([{ id: user.id, name: user.name, role: user.role }])
        ]);
        
        logger.info('Created conversation with ID:', result.rows[0].id);
      }
    }
    
    logger.info('Database test completed successfully');
  } catch (error) {
    logger.error('Database test failed:', error);
  } finally {
    await client.end();
  }
}

testMessagingSystem();
