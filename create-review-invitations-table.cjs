const { Client } = require('pg');

async function createReviewInvitationsTable() {
  console.log('🗃️ Creating review_invitations table...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/amhsj"
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create review_invitations table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS review_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID NOT NULL REFERENCES articles(id),
        reviewer_id UUID REFERENCES users(id),
        reviewer_email TEXT NOT NULL,
        reviewer_name TEXT NOT NULL,
        
        -- Invitation details
        invited_by UUID REFERENCES users(id),
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Deadlines and reminders
        response_deadline TIMESTAMP NOT NULL,
        review_deadline TIMESTAMP,
        
        -- Status tracking
        status TEXT NOT NULL DEFAULT 'pending',
        response_at TIMESTAMP,
        
        -- Reminder system
        first_reminder_sent TIMESTAMP,
        final_reminder_sent TIMESTAMP,
        withdrawn_at TIMESTAMP,
        
        -- Review completion
        review_submitted_at TIMESTAMP,
        completed_at TIMESTAMP,
        
        -- Metadata
        invitation_token TEXT UNIQUE,
        decline_reason TEXT,
        editor_notes TEXT,
        
        -- Tracking
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ review_invitations table created successfully');

    // Create indexes for performance
    const createIndexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_review_invitations_article_id ON review_invitations(article_id);`,
      `CREATE INDEX IF NOT EXISTS idx_review_invitations_reviewer_id ON review_invitations(reviewer_id);`,
      `CREATE INDEX IF NOT EXISTS idx_review_invitations_status ON review_invitations(status);`,
      `CREATE INDEX IF NOT EXISTS idx_review_invitations_response_deadline ON review_invitations(response_deadline);`,
      `CREATE INDEX IF NOT EXISTS idx_review_invitations_review_deadline ON review_invitations(review_deadline);`,
      `CREATE INDEX IF NOT EXISTS idx_review_invitations_token ON review_invitations(invitation_token);`,
    ];

    for (const query of createIndexQueries) {
      await client.query(query);
    }
    console.log('✅ Indexes created successfully');

    // Add CHECK constraints for status values
    const statusConstraint = `
      ALTER TABLE review_invitations 
      ADD CONSTRAINT IF NOT EXISTS check_review_invitation_status 
      CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'withdrawn'));
    `;
    
    await client.query(statusConstraint);
    console.log('✅ Status constraints added successfully');

    console.log('\n📋 Review Invitations Table Schema:');
    console.log('   - Comprehensive deadline management (response + review deadlines)');
    console.log('   - Automated reminder system tracking');
    console.log('   - Status progression: pending → accepted/declined → completed');
    console.log('   - Support for withdrawal after deadline expiration');
    console.log('   - Integration with existing articles and users tables');

  } catch (error) {
    console.error('❌ Error creating review_invitations table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  createReviewInvitationsTable()
    .then(() => {
      console.log('\n✅ Review invitations table migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createReviewInvitationsTable };
