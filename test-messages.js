import { db } from './lib/db/index.js';
import { conversations, users, messages } from './lib/db/schema.js';

async function testMessages() {
  try {
    console.log('Testing database connection...');
    
    // Check for existing conversations
    const existingConversations = await db.select().from(conversations);
    console.log('Existing conversations:', existingConversations.length);
    
    // Check for users
    const existingUsers = await db.select().from(users).limit(5);
    console.log('Users found:', existingUsers.length);
    
    if (existingConversations.length === 0 && existingUsers.length > 0) {
      console.log('Creating a test conversation...');
      const conv = await db.insert(conversations).values({
        subject: 'Test Message Conversation',
        type: 'editorial',
        participants: [
          { id: existingUsers[0].id, name: existingUsers[0].name || 'Test User', role: existingUsers[0].role || 'author' }
        ]
      }).returning();
      
      console.log('Created conversation:', conv[0].id);
    }
    
    console.log('Database test completed successfully');
  } catch (error) {
    console.error('Database test failed:', error);
  }
  process.exit(0);
}

testMessages();
