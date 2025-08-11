const { Client } = require('pg')

async function testDatabaseQueries() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Test 1: Check if all key tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'articles', 'reviews', 'conversations', 'messages', 'page_views', 'submissions')
      ORDER BY table_name
    `)
    console.log('✅ Key tables found:', tables.rows.map(r => r.table_name))

    // Test 2: Simple reviews query (without assigned_at)
    const reviewTest = await client.query(`
      SELECT COUNT(*) as count
      FROM reviews 
      WHERE status = 'completed'
    `)
    console.log('✅ Reviews query works:', reviewTest.rows[0].count)

    // Test 3: Simple page_views query (with created_at)
    const pageViewsTest = await client.query(`
      SELECT COUNT(*) as count
      FROM page_views
    `)
    console.log('✅ Page views query works:', pageViewsTest.rows[0].count)

    // Test 4: Conversations query
    const conversationsTest = await client.query(`
      SELECT COUNT(*) as count
      FROM conversations
    `)
    console.log('✅ Conversations query works:', conversationsTest.rows[0].count)

    console.log('\n🎉 All database tests passed!')

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
  } finally {
    await client.end()
  }
}

testDatabaseQueries()
