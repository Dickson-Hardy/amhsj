const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

/**
 * AMHSJ Academic Journal Role Setup Script (Simplified)
 * Creates essential roles for testing the academic journal workflow system
 */
async function setupEssentialRoles() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to database...');
    
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    
    // Hash password for all users (same password for demo purposes)
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    console.log('🚀 Starting AMHSJ essential role setup...');
    console.log('');

    // =========================================================================
    // 1. ADMIN ROLE
    // =========================================================================
    console.log('👑 Creating System Administrator...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio, 
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'admin@amhsj.org',
        'System Administrator',
        $1,
        'admin',
        'AMHSJ Editorial Office',
        'System administrator responsible for technical infrastructure and user management.',
        '["system_administration", "database_management", "security"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["system_admin", "technical_support"]'::jsonb,
        ARRAY['journal_management', 'editorial_systems'],
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Admin user created');

    // =========================================================================
    // 2. EDITOR-IN-CHIEF ROLE
    // =========================================================================
    console.log('👑 Creating Editor-in-Chief...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'eic@amhsj.org',
        'Dr. Sarah Johnson',
        $1,
        'editor',
        'Harvard Medical School',
        'Editor-in-Chief with 20+ years of experience in medical research and publishing.',
        '["cardiovascular_medicine", "editorial_leadership", "research_methodology"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["cardiology", "editorial_management", "research_oversight"]'::jsonb,
        ARRAY['cardiovascular_research', 'editorial_innovation', 'academic_publishing'],
        '0000-0002-1825-0097',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Editor-in-Chief created');

    // =========================================================================
    // 3. MANAGING EDITOR ROLE
    // =========================================================================
    console.log('📋 Creating Managing Editor...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'managing@amhsj.org',
        'Dr. Michael Chen',
        $1,
        'editor',
        'Johns Hopkins University',
        'Managing Editor responsible for editorial workflow optimization.',
        '["editorial_management", "workflow_optimization", "peer_review_systems"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["editorial_operations", "manuscript_management", "reviewer_coordination"]'::jsonb,
        ARRAY['editorial_efficiency', 'peer_review_innovation', 'publishing_technology'],
        '0000-0003-1234-5678',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Managing Editor created');

    // =========================================================================
    // 4. SECTION EDITOR ROLE
    // =========================================================================
    console.log('📚 Creating Section Editor (Cardiology)...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'cardiology.editor@amhsj.org',
        'Dr. Elizabeth Williams',
        $1,
        'editor',
        'Mayo Clinic',
        'Section Editor for Cardiology with expertise in interventional cardiology.',
        '["interventional_cardiology", "heart_failure", "cardiac_imaging"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["cardiology", "interventional_procedures", "cardiac_research"]'::jsonb,
        ARRAY['interventional_cardiology', 'heart_failure_management', 'cardiac_imaging_innovation'],
        '0000-0004-2345-6789',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Section Editor (Cardiology) created');

    // =========================================================================
    // 5. PRODUCTION EDITOR ROLE
    // =========================================================================
    console.log('🖨️ Creating Production Editor...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'production@amhsj.org',
        'Dr. Lisa Thompson',
        $1,
        'editor',
        'AMHSJ Editorial Office',
        'Production Editor responsible for copyediting and publication workflow.',
        '["copyediting", "typesetting", "publication_workflow", "doi_management"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["production_editing", "manuscript_formatting", "publication_systems"]'::jsonb,
        ARRAY['editorial_technology', 'publication_standards', 'digital_publishing'],
        '0000-0007-5678-9012',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Production Editor created');

    // =========================================================================
    // 6. GUEST EDITOR ROLE
    // =========================================================================
    console.log('⭐ Creating Guest Editor...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'guest.ai@amhsj.org',
        'Dr. Ahmed Hassan',
        $1,
        'editor',
        'MIT CSAIL',
        'Guest Editor for AI in Medicine special issue.',
        '["artificial_intelligence", "machine_learning", "medical_ai", "computer_vision"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["medical_ai", "machine_learning", "computer_vision", "healthcare_informatics"]'::jsonb,
        ARRAY['ai_diagnostics', 'machine_learning_healthcare', 'medical_image_analysis'],
        '0000-0008-6789-0123',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Guest Editor created');

    // =========================================================================
    // 7. ASSOCIATE EDITOR ROLE
    // =========================================================================
    console.log('✏️ Creating Associate Editor...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'associate1@amhsj.org',
        'Dr. James Wilson',
        $1,
        'editor',
        'UCSF',
        'Associate Editor specializing in internal medicine.',
        '["internal_medicine", "clinical_research", "evidence_based_medicine"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["internal_medicine", "clinical_research", "systematic_reviews"]'::jsonb,
        ARRAY['clinical_trials', 'evidence_synthesis', 'medical_education'],
        '0000-0009-7890-1234',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Associate Editor created');

    // =========================================================================
    // 8. REVIEWER ROLE
    // =========================================================================
    console.log('👥 Creating Reviewer...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'reviewer1@amhsj.org',
        'Dr. David Kim',
        $1,
        'reviewer',
        'Cleveland Clinic',
        'Senior reviewer specializing in cardiovascular surgery.',
        '["cardiovascular_surgery", "interventional_cardiology", "cardiac_devices"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["cardiac_surgery", "interventional_cardiology", "medical_devices"]'::jsonb,
        ARRAY['minimally_invasive_surgery', 'cardiac_interventions', 'device_innovation'],
        '0000-0011-9012-3456',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Reviewer created');

    // =========================================================================
    // 9. AUTHOR ROLE
    // =========================================================================
    console.log('📝 Creating Author...');
    
    await pool.query(`
      INSERT INTO users (
        id, email, name, password, role, affiliation, bio,
        expertise, is_verified, is_active, application_status,
        profile_completeness, specializations, research_interests,
        orcid, orcid_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'author1@example.org',
        'Dr. Rachel Martinez',
        $1,
        'author',
        'Emory University School of Medicine',
        'Clinical researcher focusing on infectious disease prevention.',
        '["infectious_diseases", "vaccine_development", "clinical_trials"]'::jsonb,
        true,
        true,
        'approved',
        95,
        '["infectious_diseases", "vaccines", "clinical_research"]'::jsonb,
        ARRAY['vaccine_efficacy', 'disease_prevention', 'clinical_trials'],
        '0000-0015-3456-7890',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    console.log('✓ Author created');

    console.log('');
    console.log('🎉 Essential role setup completed successfully!');
    console.log('');
    console.log('📋 Roles created:');
    console.log('  ✓ System Administrator (admin@amhsj.org)');
    console.log('  ✓ Editor-in-Chief (eic@amhsj.org)');
    console.log('  ✓ Managing Editor (managing@amhsj.org)');
    console.log('  ✓ Section Editor (cardiology.editor@amhsj.org)');
    console.log('  ✓ Production Editor (production@amhsj.org)');
    console.log('  ✓ Guest Editor (guest.ai@amhsj.org)');
    console.log('  ✓ Associate Editor (associate1@amhsj.org)');
    console.log('  ✓ Reviewer (reviewer1@amhsj.org)');
    console.log('  ✓ Author (author1@example.org)');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('  Password for all accounts: password123');
    console.log('');
    console.log('⚠️  Note: Change default passwords in production!');

  } catch (error) {
    console.error('❌ Error setting up roles:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupEssentialRoles()
  .then(() => {
    console.log('✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
