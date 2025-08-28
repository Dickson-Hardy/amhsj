import { logger } from "@/lib/logger";
import { db } from './lib/db/index.js';
import { conversations, users, messages } from './lib/db/schema.js';

async function testMessages() {
  try {
    logger.info('Testing database connection...');
    
    // Check for existing conversations
    const existingConversations = await db.select().from(conversations);
    logger.info('Existing conversations:', existingConversations.length);
    
    // Check for users
    const existingUsers = await db.select().from(users).limit(5);
    logger.info('Users found:', existingUsers.length);
    
    if (existingConversations.length === 0 && existingUsers.length > 0) {
      logger.info('Creating a test conversation...');
      const conv = await db.insert(conversations).values({
        subject: 'Test Message Conversation',
        type: 'editorial',
        participants: [
          { id: existingUsers[0].id, name: existingUsers[0].name || 'Test User', role: existingUsers[0].role || 'author' }
        ]
      }).returning();
      
      logger.info('Created conversation:', conv[0].id);
    }
    
    logger.info('Database test completed successfully');
  } catch (error) {
    logger.error('Database test failed:', error);
  }
  process.exit(0);
}

testMessages();
