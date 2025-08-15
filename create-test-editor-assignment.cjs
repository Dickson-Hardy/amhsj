const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function createTestEditorAssignment() {
    const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_gifD5p1lIBTc@ep-fragrant-bonus-abz6h9us-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        console.log('🧪 Creating Test Editor Assignment...\n');

        // 1. Get a sample article
        const articleResult = await pool.query(`
            SELECT id, title, abstract, category 
            FROM articles 
            WHERE status = 'submitted'
            LIMIT 1;
        `);

        if (articleResult.rows.length === 0) {
            console.log('❌ No submitted articles found to test with');
            return;
        }

        const article = articleResult.rows[0];
        console.log(`📄 Selected article: "${article.title}"`);

        // 2. Get an available editor
        const editorResult = await pool.query(`
            SELECT id, name, email, role 
            FROM users 
            WHERE role IN ('editor', 'chief_editor', 'associate_editor')
            LIMIT 1;
        `);

        if (editorResult.rows.length === 0) {
            console.log('❌ No editors found to test with');
            return;
        }

        const editor = editorResult.rows[0];
        console.log(`👨‍💼 Selected editor: ${editor.name} (${editor.role})`);

        // 3. Create test assignment
        const assignmentId = uuidv4();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 3); // 3 days from now

        const insertResult = await pool.query(`
            INSERT INTO editor_assignments (
                id, article_id, editor_id, assigned_at, deadline,
                status, assignment_reason, system_generated, created_at, updated_at
            ) VALUES (
                $1, $2, $3, NOW(), $4,
                'pending', $5, true, NOW(), NOW()
            ) RETURNING *;
        `, [
            assignmentId,
            article.id,
            editor.id,
            deadline,
            `Test assignment for ${article.category} expertise`
        ]);

        console.log(`✅ Assignment created with ID: ${assignmentId}`);

        // 4. Verify the assignment
        const verifyResult = await pool.query(`
            SELECT 
                ea.*,
                a.title as article_title,
                u.name as editor_name,
                u.email as editor_email
            FROM editor_assignments ea
            JOIN articles a ON ea.article_id = a.id
            JOIN users u ON ea.editor_id = u.id
            WHERE ea.id = $1;
        `, [assignmentId]);

        const assignment = verifyResult.rows[0];
        
        console.log('\n📋 Assignment Details:');
        console.log(`  Article: ${assignment.article_title}`);
        console.log(`  Editor: ${assignment.editor_name} (${assignment.editor_email})`);
        console.log(`  Status: ${assignment.status}`);
        console.log(`  Deadline: ${assignment.deadline.toLocaleDateString()}`);
        console.log(`  Assignment Reason: ${assignment.assignment_reason}`);

        // 5. Generate assignment URL for testing
        const assignmentUrl = `http://localhost:3000/editor/assignment/${assignmentId}`;
        console.log(`\n🔗 Assignment URL: ${assignmentUrl}`);

        console.log('\n📧 Email template data:');
        console.log({
            editorName: editor.name,
            articleTitle: article.title,
            articleAbstract: article.abstract,
            assignmentId: assignmentId,
            deadline: deadline.toISOString()
        });

        console.log('\n✅ Test assignment created successfully!');
        console.log('\n📝 To test the workflow:');
        console.log('1. Start the Next.js development server');
        console.log('2. Visit the assignment URL above');
        console.log('3. Test accepting/declining with conflict declarations');
        console.log('4. Check the API response and email functionality');

        return {
            assignmentId,
            assignmentUrl,
            editor,
            article
        };

    } catch (error) {
        console.error('❌ Error creating test assignment:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the test
if (require.main === module) {
    createTestEditorAssignment()
        .then((result) => {
            if (result) {
                console.log(`\n🎉 Test assignment ready! Assignment ID: ${result.assignmentId}`);
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = { createTestEditorAssignment };
