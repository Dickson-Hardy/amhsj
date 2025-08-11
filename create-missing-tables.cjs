const { Client } = require('pg')

async function createMissingTables() {
  const client = new Client({ 
    connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
  })
  
  try {
    await client.connect()
    console.log('Connected to database')

    // Create volumes table
    const volumesSQL = `
      CREATE TABLE IF NOT EXISTS volumes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        number TEXT NOT NULL,
        year INTEGER NOT NULL,
        title TEXT,
        description TEXT,
        cover_image TEXT,
        published_date TIMESTAMP WITH TIME ZONE,
        status TEXT NOT NULL DEFAULT 'draft',
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    await client.query(volumesSQL)
    console.log('✓ Created volumes table')

    // Create issues table
    const issuesSQL = `
      CREATE TABLE IF NOT EXISTS issues (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        volume_id UUID REFERENCES volumes(id) ON DELETE CASCADE,
        number TEXT NOT NULL,
        title TEXT,
        description TEXT,
        cover_image TEXT,
        published_date TIMESTAMP WITH TIME ZONE,
        status TEXT NOT NULL DEFAULT 'draft',
        special_issue BOOLEAN DEFAULT FALSE,
        guest_editors JSONB,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    await client.query(issuesSQL)
    console.log('✓ Created issues table')

    // Create indexes for better performance
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_volumes_year ON volumes(year);
      CREATE INDEX IF NOT EXISTS idx_volumes_status ON volumes(status);
      CREATE INDEX IF NOT EXISTS idx_issues_volume_id ON issues(volume_id);
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
      CREATE INDEX IF NOT EXISTS idx_issues_published_date ON issues(published_date);
    `

    await client.query(indexesSQL)
    console.log('✓ Created indexes')

    console.log('All missing tables created successfully!')

  } catch (error) {
    console.error('Error creating tables:', error.message)
  } finally {
    await client.end()
  }
}

createMissingTables()
