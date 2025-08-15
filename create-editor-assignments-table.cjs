const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function createEditorAssignmentsTable() {
    const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        console.log('Creating editor_assignments table...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'scripts', 'create-editor-assignments-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        await pool.query(sql);
        
        console.log('✅ editor_assignments table created successfully!');
        
        // Verify the table was created
        const verifyResult = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'editor_assignments'
            ORDER BY ordinal_position;
        `);
        
        console.log('\n📋 Table structure:');
        verifyResult.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
        // Check indexes
        const indexResult = await pool.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'editor_assignments';
        `);
        
        console.log('\n🔍 Indexes created:');
        indexResult.rows.forEach(row => {
            console.log(`  ${row.indexname}`);
        });
        
    } catch (error) {
        console.error('❌ Error creating editor_assignments table:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    createEditorAssignmentsTable()
        .then(() => {
            console.log('\n🎉 Editor assignments table migration completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { createEditorAssignmentsTable };
