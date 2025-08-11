const { Client } = require('pg')

async function checkAllTables() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  try {
    await client.connect()
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('Existing tables:')
    result.rows.forEach(row => console.log('-', row.table_name))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

checkAllTables()
