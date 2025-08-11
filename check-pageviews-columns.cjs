const { Client } = require('pg')

async function checkPageViewsTable() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  try {
    await client.connect()
    const result = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'page_views'`)
    console.log('page_views columns:', result.rows.map(r => r.column_name))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

checkPageViewsTable()
