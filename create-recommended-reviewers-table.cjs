const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

const client = postgres(connectionString);
const db = drizzle(client);

async function createRecommendedReviewersTable() {
  console.log('🚀 Creating recommended_reviewers table...');

  try {
    // Create the recommended_reviewers table
    await client`
      CREATE TABLE IF NOT EXISTS "recommended_reviewers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "article_id" uuid NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "affiliation" text NOT NULL,
        "expertise" text,
        "suggested_by" uuid REFERENCES "users"("id"),
        "status" text DEFAULT 'suggested', -- suggested, contacted, accepted, declined, unavailable
        "contact_attempts" integer DEFAULT 0,
        "notes" text,
        "created_at" timestamp DEFAULT NOW(),
        "updated_at" timestamp DEFAULT NOW()
      );
    `;

    console.log('✅ Successfully created recommended_reviewers table');

    // Create indexes for better performance
    await client`
      CREATE INDEX IF NOT EXISTS "idx_recommended_reviewers_article_id" 
      ON "recommended_reviewers" ("article_id");
    `;

    await client`
      CREATE INDEX IF NOT EXISTS "idx_recommended_reviewers_email" 
      ON "recommended_reviewers" ("email");
    `;

    await client`
      CREATE INDEX IF NOT EXISTS "idx_recommended_reviewers_status" 
      ON "recommended_reviewers" ("status");
    `;

    console.log('✅ Successfully created indexes for recommended_reviewers table');

    // Check if the table was created successfully
    const result = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'recommended_reviewers'
      ORDER BY ordinal_position;
    `;

    console.log('📋 Table structure:');
    result.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type} ${column.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
if (require.main === module) {
  createRecommendedReviewersTable()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createRecommendedReviewersTable };
