const postgres = require('postgres')

async function checkConstraints() {
  const sql = postgres(process.env.DATABASE_URL)
  
  try {
    console.log('🔍 Checking database constraints...')
    
    // Check role constraint
    const roleConstraint = await sql`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'users')
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%'
    `
    
    console.log('Role constraints:', roleConstraint)
    
    // Check actual table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('role', 'bio', 'orcid')
      ORDER BY column_name
    `
    
    console.log('Table columns:', tableInfo)
    
    // Test insert to see what fails
    console.log('Testing insert...')
    const testInsert = await sql`
      INSERT INTO users (name, email, role, affiliation, bio, orcid) 
      VALUES ('Test User', 'test@example.com', 'author', 'Test University', 'Test bio', null)
      RETURNING id
    `
    
    console.log('Test insert successful:', testInsert)
    
    // Clean up
    await sql`DELETE FROM users WHERE email = 'test@example.com'`
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    })
  } finally {
    await sql.end()
  }
}

checkConstraints()