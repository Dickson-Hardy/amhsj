/**
 * Database Migration: Fix admin_logs table structure
 * This migration ensures the admin_logs table has all required columns
 */

import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export async function migrateAdminLogsTable() {
  console.log('🔄 Starting admin_logs table migration...')
  
  try {
    // Check if the table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_logs'
      );
    `)

    if (!tableExists.rows[0]?.exists) {
      console.log('Creating admin_logs table...')
      await db.execute(sql`
        CREATE TABLE admin_logs (
          id TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL,
          admin_email TEXT NOT NULL,
          action TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id TEXT NOT NULL,
          details TEXT DEFAULT '',
          ip_address TEXT DEFAULT 'unknown',
          user_agent TEXT DEFAULT 'unknown',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `)
      console.log('✅ Created admin_logs table')
      return
    }

    // Table exists, check and add missing columns
    const columns = [
      { name: 'admin_id', type: 'TEXT', nullable: false },
      { name: 'admin_email', type: 'TEXT', nullable: false },
      { name: 'resource_type', type: 'TEXT', nullable: false },
      { name: 'resource_id', type: 'TEXT', nullable: false },
      { name: 'details', type: 'TEXT', nullable: true, default: "''" },
      { name: 'ip_address', type: 'TEXT', nullable: true, default: "'unknown'" },
      { name: 'user_agent', type: 'TEXT', nullable: true, default: "'unknown'" }
    ]

    for (const column of columns) {
      try {
        const columnExists = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'admin_logs' 
          AND column_name = ${column.name};
        `)

        if (columnExists.rows.length === 0) {
          console.log(`Adding missing column: ${column.name}`)
          
          let alterQuery = `ALTER TABLE admin_logs ADD COLUMN ${column.name} ${column.type}`
          if (column.default) {
            alterQuery += ` DEFAULT ${column.default}`
          }
          if (!column.nullable) {
            alterQuery += ` NOT NULL`
          }

          await db.execute(sql.raw(alterQuery))
          console.log(`✅ Added column: ${column.name}`)
        }
      } catch (error) {
        console.warn(`⚠️ Could not add column ${column.name}:`, error)
      }
    }

    console.log('✅ admin_logs table migration completed successfully')

  } catch (error) {
    console.error('❌ admin_logs migration failed:', error)
    throw error
  }
}

// Self-executing migration
if (require.main === module) {
  migrateAdminLogsTable()
    .then(() => {
      console.log('Migration completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}