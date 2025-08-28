// Database migration script for production deployment
import { logger } from "@/lib/logger";
import { db } from "../lib/db/index.js"
import { sql } from "drizzle-orm"

async function runMigrations() {
  try {
    logger.info("🔄 Running database migrations...")

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status 
      ON articles(status);
    `)

    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category 
      ON articles(category);
    `)

    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_published_date 
      ON articles(published_date) WHERE published_date IS NOT NULL;
    `)

    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_author_id 
      ON articles(author_id);
    `)

    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_article_id 
      ON reviews(article_id);
    `)

    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer_id 
      ON reviews(reviewer_id);
    `)

    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id 
      ON notifications(user_id);
    `)

    // Create full-text search indexes
    await db.execute(sql`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_search 
      ON articles USING gin(to_tsvector('english', title || ' ' || abstract));
    `)

    logger.info("✅ Database migrations completed successfully!")
  } catch (error) {
    logger.error("❌ Migration failed:", error)
    throw error
  }
}

runMigrations()
