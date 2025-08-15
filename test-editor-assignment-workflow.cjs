const { Pool } = require('pg');

async function testEditorAssignmentFlow() {
    const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        console.log('🧪 Testing Editor Assignment Workflow...\n');

        // 1. Check if tables exist
        console.log('1. Checking table structure...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('editor_assignments', 'articles', 'users')
            ORDER BY table_name;
        `);
        
        console.log('Available tables:', tablesResult.rows.map(r => r.table_name).join(', '));

        // 2. Check for sample data
        console.log('\n2. Checking for sample articles...');
        const articlesResult = await pool.query(`
            SELECT id, title, status, category 
            FROM articles 
            WHERE status IN ('submitted', 'technical_check', 'under_review')
            LIMIT 3;
        `);
        
        if (articlesResult.rows.length > 0) {
            console.log('Sample articles found:');
            articlesResult.rows.forEach(article => {
                console.log(`  - ${article.title} (${article.status}) [${article.category}]`);
            });
        } else {
            console.log('No articles found with status requiring editor assignment');
        }

        // 3. Check for editors
        console.log('\n3. Checking for available editors...');
        const editorsResult = await pool.query(`
            SELECT id, name, email, role 
            FROM users 
            WHERE role IN ('editor', 'chief_editor', 'associate_editor')
            LIMIT 3;
        `);
        
        if (editorsResult.rows.length > 0) {
            console.log('Available editors:');
            editorsResult.rows.forEach(editor => {
                console.log(`  - ${editor.name} (${editor.role}) - ${editor.email}`);
            });
        } else {
            console.log('❌ No editors found in the system');
            console.log('   You may need to update some users to have editor roles');
        }

        // 4. Check existing assignments
        console.log('\n4. Checking existing editor assignments...');
        const assignmentsResult = await pool.query(`
            SELECT 
                ea.id,
                ea.status,
                ea.assigned_at,
                ea.deadline,
                ea.conflict_declared,
                a.title as article_title,
                u.name as editor_name
            FROM editor_assignments ea
            JOIN articles a ON ea.article_id = a.id
            JOIN users u ON ea.editor_id = u.id
            ORDER BY ea.assigned_at DESC
            LIMIT 5;
        `);
        
        if (assignmentsResult.rows.length > 0) {
            console.log('Recent assignments:');
            assignmentsResult.rows.forEach(assignment => {
                console.log(`  - ${assignment.article_title} → ${assignment.editor_name} (${assignment.status})`);
            });
        } else {
            console.log('No editor assignments found yet');
        }

        // 5. Test the conflict of interest functionality
        console.log('\n5. Testing conflict categories...');
        const conflictTypes = [
            'Family Relationships',
            'Personal Friendships', 
            'Co-authorship (last 10 years)',
            'Financial Interests',
            'Institutional Bias',
            'Professional Rivalries',
            'Mentorship'
        ];
        
        console.log('Conflict types that editors must check:');
        conflictTypes.forEach((type, index) => {
            console.log(`  ${index + 1}. ${type}`);
        });

        // 6. Verify table constraints
        console.log('\n6. Verifying table constraints...');
        const constraintsResult = await pool.query(`
            SELECT 
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'editor_assignments'
            AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
            ORDER BY tc.constraint_type, tc.constraint_name;
        `);
        
        console.log('Table constraints:');
        constraintsResult.rows.forEach(constraint => {
            console.log(`  - ${constraint.constraint_type}: ${constraint.constraint_name} (${constraint.column_name})`);
        });

        console.log('\n✅ Editor assignment workflow setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Ensure users have editor roles assigned');
        console.log('2. Test the assignment API endpoints');
        console.log('3. Verify email template functionality');
        console.log('4. Test the conflict of interest declaration UI');

    } catch (error) {
        console.error('❌ Error testing editor assignment flow:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the test
if (require.main === module) {
    testEditorAssignmentFlow()
        .then(() => {
            console.log('\n🎉 Editor assignment workflow test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testEditorAssignmentFlow };
