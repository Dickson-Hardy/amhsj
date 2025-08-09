import { drizzle } from "drizzle-orm/neon-http"
import { neon, neonConfig } from "@neondatabase/serverless"
import * as schema from "./schema"

// fetchConnectionCache is now always true by default in newer SDKs; avoid setting to silence deprecation warnings
// neonConfig.fetchConnectionCache = true

// Create connection with pooling
const sql = neon(process.env.DATABASE_URL!)

// Create Drizzle instance with schema
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === "development",
})
// Expose raw SQL connection for direct queries
export { sql }

// Database health check function
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return result[0].test === 1
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Connection status monitoring
export async function getConnectionStatus() {
  try {
    const start = Date.now()
    await sql`SELECT 1`
    const latency = Date.now() - start
    
    return {
      connected: true,
      latency,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}
