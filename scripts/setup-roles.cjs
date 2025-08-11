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
 * AMHSJ Academic Journal Role Setup Script
 * Creates all necessary roles, users, and associated data for the complete academic journal workflow system
 */
async function setupRoles() {
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
    
    console.log('🚀 Starting AMHSJ role setup...');
    console.log('');

    // =========================================================================
    // 1. ADMIN ROLE SETUP
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
    // 2. EDITOR-IN-CHIEF ROLE SETUP
    // =========================================================================
    console.log('👑 Creating Editor-in-Chief...');
    
    const eicResult = await pool.query(`
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
        'editor-in-chief',
        'Harvard Medical School',
        'Editor-in-Chief with 20+ years of experience in medical research and publishing. Specializes in cardiovascular medicine and editorial leadership.',
        '["cardiovascular_medicine", "editorial_leadership", "research_methodology"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["cardiology", "editorial_management", "research_oversight"]'::jsonb,
        '["cardiovascular_research", "editorial_innovation", "academic_publishing"]'::jsonb,
        '0000-0002-1825-0097',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [hashedPassword]);

    // Create Editor-in-Chief Profile
    if (eicResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO editor_profiles (
          user_id, editor_type, assigned_sections, current_workload, max_workload,
          is_accepting_submissions, editorial_experience, start_date, is_active
        ) VALUES (
          $1, 'chief', 
          '["all_sections", "general", "cardiovascular", "internal_medicine"]'::jsonb,
          5, 15, true,
          'Former Associate Editor at NEJM, 15 years editorial experience, 200+ publications',
          NOW(), true
        ) ON CONFLICT (user_id) DO NOTHING
      `, [eicResult.rows[0].id]);
    }

    console.log('✓ Editor-in-Chief created');

    // =========================================================================
    // 3. MANAGING EDITOR ROLE SETUP
    // =========================================================================
    console.log('📋 Creating Managing Editor...');
    
    const managingResult = await pool.query(`
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
        'managing-editor',
        'Johns Hopkins University',
        'Managing Editor responsible for editorial workflow optimization and operations management.',
        '["editorial_management", "workflow_optimization", "peer_review_systems"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["editorial_operations", "manuscript_management", "reviewer_coordination"]'::jsonb,
        '["editorial_efficiency", "peer_review_innovation", "publishing_technology"]'::jsonb,
        '0000-0003-1234-5678',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [hashedPassword]);

    if (managingResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO editor_profiles (
          user_id, editor_type, assigned_sections, current_workload, max_workload,
          is_accepting_submissions, editorial_experience, start_date, is_active
        ) VALUES (
          $1, 'managing', 
          '["operations", "workflow", "reviewer_management"]'::jsonb,
          8, 20, true,
          'Managing Editor at 3 major journals, workflow optimization specialist',
          NOW(), true
        ) ON CONFLICT (user_id) DO NOTHING
      `, [managingResult.rows[0].id]);
    }

    console.log('✓ Managing Editor created');

    // =========================================================================
    // 4. SECTION EDITORS ROLE SETUP
    // =========================================================================
    console.log('📚 Creating Section Editors...');
    
    const sectionEditors = [
      {
        email: 'cardiology.editor@amhsj.org',
        name: 'Dr. Elizabeth Williams',
        affiliation: 'Mayo Clinic',
        bio: 'Section Editor for Cardiology with expertise in interventional cardiology and heart failure research.',
        expertise: '["interventional_cardiology", "heart_failure", "cardiac_imaging"]',
        specializations: '["cardiology", "interventional_procedures", "cardiac_research"]',
        research_interests: '["interventional_cardiology", "heart_failure_management", "cardiac_imaging_innovation"]',
        orcid: '0000-0004-2345-6789',
        sections: '["cardiology", "cardiovascular_medicine"]'
      },
      {
        email: 'neurology.editor@amhsj.org',
        name: 'Dr. Robert Davis',
        affiliation: 'Stanford University Medical Center',
        bio: 'Section Editor for Neurology specializing in neurodegenerative diseases and neuroimaging.',
        expertise: '["neurodegenerative_diseases", "neuroimaging", "cognitive_neuroscience"]',
        specializations: '["neurology", "neurodegeneration", "brain_imaging"]',
        research_interests: '["alzheimer_research", "parkinson_disease", "neuroimaging_techniques"]',
        orcid: '0000-0005-3456-7890',
        sections: '["neurology", "neuroscience"]'
      },
      {
        email: 'oncology.editor@amhsj.org',
        name: 'Dr. Maria Rodriguez',
        affiliation: 'MD Anderson Cancer Center',
        bio: 'Section Editor for Oncology with focus on precision medicine and immunotherapy research.',
        expertise: '["precision_oncology", "immunotherapy", "cancer_genomics"]',
        specializations: '["oncology", "precision_medicine", "immunotherapy"]',
        research_interests: '["cancer_genomics", "targeted_therapy", "immune_checkpoint_inhibitors"]',
        orcid: '0000-0006-4567-8901',
        sections: '["oncology", "cancer_research"]'
      }
    ];

    for (const editor of sectionEditors) {
      const result = await pool.query(`
        INSERT INTO users (
          id, email, name, password, role, affiliation, bio,
          expertise, is_verified, is_active, application_status,
          profile_completeness, specializations, research_interests,
          orcid, orcid_verified,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          $1, $2, $3,
          'section-editor',
          $4, $5,
          $6::jsonb,
          true, true, 'approved', 100,
          $7::jsonb,
          $8::jsonb,
          $9, true,
          NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [
        editor.email, editor.name, hashedPassword, editor.affiliation, editor.bio,
        editor.expertise, editor.specializations, editor.research_interests, editor.orcid
      ]);

      if (result.rows.length > 0) {
        await pool.query(`
          INSERT INTO editor_profiles (
            user_id, editor_type, assigned_sections, current_workload, max_workload,
            is_accepting_submissions, editorial_experience, start_date, is_active
          ) VALUES (
            $1, 'section', $2::jsonb, 3, 12, true,
            'Section Editor experience at leading medical journals',
            NOW(), true
          ) ON CONFLICT (user_id) DO NOTHING
        `, [result.rows[0].id, editor.sections]);
      }
    }

    console.log('✓ Section Editors created');

    // =========================================================================
    // 5. PRODUCTION EDITOR ROLE SETUP
    // =========================================================================
    console.log('🖨️ Creating Production Editor...');
    
    const productionResult = await pool.query(`
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
        'production-editor',
        'AMHSJ Editorial Office',
        'Production Editor responsible for copyediting, typesetting, and publication workflow management.',
        '["copyediting", "typesetting", "publication_workflow", "doi_management"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["production_editing", "manuscript_formatting", "publication_systems"]'::jsonb,
        '["editorial_technology", "publication_standards", "digital_publishing"]'::jsonb,
        '0000-0007-5678-9012',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [hashedPassword]);

    if (productionResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO editor_profiles (
          user_id, editor_type, assigned_sections, current_workload, max_workload,
          is_accepting_submissions, editorial_experience, start_date, is_active
        ) VALUES (
          $1, 'production', 
          '["production", "copyediting", "typesetting", "publication"]'::jsonb,
          12, 25, true,
          'Production Editor at multiple medical journals, XML/JATS specialist',
          NOW(), true
        ) ON CONFLICT (user_id) DO NOTHING
      `, [productionResult.rows[0].id]);
    }

    console.log('✓ Production Editor created');

    // =========================================================================
    // 6. GUEST EDITOR ROLE SETUP
    // =========================================================================
    console.log('⭐ Creating Guest Editor...');
    
    const guestResult = await pool.query(`
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
        'guest-editor',
        'MIT Computer Science and Artificial Intelligence Laboratory',
        'Guest Editor for AI in Medicine special issue. Expert in machine learning applications in healthcare.',
        '["artificial_intelligence", "machine_learning", "medical_ai", "computer_vision"]'::jsonb,
        true,
        true,
        'approved',
        100,
        '["medical_ai", "machine_learning", "computer_vision", "healthcare_informatics"]'::jsonb,
        '["ai_diagnostics", "machine_learning_healthcare", "medical_image_analysis"]'::jsonb,
        '0000-0008-6789-0123',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [hashedPassword]);

    if (guestResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO editor_profiles (
          user_id, editor_type, assigned_sections, current_workload, max_workload,
          is_accepting_submissions, editorial_experience, start_date, is_active
        ) VALUES (
          $1, 'guest', 
          '["artificial_intelligence", "medical_ai", "machine_learning"]'::jsonb,
          2, 8, true,
          'Guest Editor for AI in Medicine special issues at Nature Medicine and NEJM AI',
          NOW(), true
        ) ON CONFLICT (user_id) DO NOTHING
      `, [guestResult.rows[0].id]);
    }

    console.log('✓ Guest Editor created');

    // =========================================================================
    // 7. ASSOCIATE EDITORS ROLE SETUP
    // =========================================================================
    console.log('✏️ Creating Associate Editors...');
    
    const associateEditors = [
      {
        email: 'associate1@amhsj.org',
        name: 'Dr. James Wilson',
        affiliation: 'University of California, San Francisco',
        bio: 'Associate Editor specializing in internal medicine and clinical research methodology.',
        expertise: '["internal_medicine", "clinical_research", "evidence_based_medicine"]',
        specializations: '["internal_medicine", "clinical_research", "systematic_reviews"]',
        research_interests: '["clinical_trials", "evidence_synthesis", "medical_education"]',
        orcid: '0000-0009-7890-1234',
        sections: '["internal_medicine", "clinical_research"]'
      },
      {
        email: 'associate2@amhsj.org',
        name: 'Dr. Jennifer Brown',
        affiliation: 'University of Pennsylvania',
        bio: 'Associate Editor with expertise in pediatric medicine and global health.',
        expertise: '["pediatric_medicine", "global_health", "infectious_diseases"]',
        specializations: '["pediatrics", "global_health", "infectious_diseases", "tropical_medicine"]',
        research_interests: '["child_health", "disease_prevention", "health_systems"]',
        orcid: '0000-0010-8901-2345',
        sections: '["pediatrics", "global_health"]'
      }
    ];

    for (const editor of associateEditors) {
      const result = await pool.query(`
        INSERT INTO users (
          id, email, name, password, role, affiliation, bio,
          expertise, is_verified, is_active, application_status,
          profile_completeness, specializations, research_interests,
          orcid, orcid_verified,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          $1, $2, $3,
          'editor',
          $4, $5,
          $6::jsonb,
          true, true, 'approved', 100,
          $7::jsonb,
          $8::jsonb,
          $9, true,
          NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [
        editor.email, editor.name, hashedPassword, editor.affiliation, editor.bio,
        editor.expertise, editor.specializations, editor.research_interests, editor.orcid
      ]);

      if (result.rows.length > 0) {
        await pool.query(`
          INSERT INTO editor_profiles (
            user_id, editor_type, assigned_sections, current_workload, max_workload,
            is_accepting_submissions, editorial_experience, start_date, is_active
          ) VALUES (
            $1, 'associate', $2::jsonb, 4, 10, true,
            'Associate Editor at peer-reviewed medical journals',
            NOW(), true
          ) ON CONFLICT (user_id) DO NOTHING
        `, [result.rows[0].id, editor.sections]);
      }
    }

    console.log('✓ Associate Editors created');

    // =========================================================================
    // 8. REVIEWERS ROLE SETUP
    // =========================================================================
    console.log('👥 Creating Reviewers...');
    
    const reviewers = [
      {
        email: 'reviewer1@amhsj.org',
        name: 'Dr. David Kim',
        affiliation: 'Cleveland Clinic',
        bio: 'Senior reviewer specializing in cardiovascular surgery and interventional cardiology.',
        expertise: '["cardiovascular_surgery", "interventional_cardiology", "cardiac_devices"]',
        specializations: '["cardiac_surgery", "interventional_cardiology", "medical_devices"]',
        research_interests: '["minimally_invasive_surgery", "cardiac_interventions", "device_innovation"]',
        orcid: '0000-0011-9012-3456',
        max_reviews: 4,
        avg_time: 14,
        completed: 45,
        quality: 92
      },
      {
        email: 'reviewer2@amhsj.org',
        name: 'Dr. Susan Lee',
        affiliation: 'Memorial Sloan Kettering Cancer Center',
        bio: 'Senior reviewer with expertise in oncology and cancer biology research.',
        expertise: '["oncology", "cancer_biology", "tumor_immunology"]',
        specializations: '["oncology", "cancer_research", "immunotherapy", "clinical_oncology"]',
        research_interests: '["cancer_immunotherapy", "tumor_biology", "precision_oncology"]',
        orcid: '0000-0012-0123-4567',
        max_reviews: 4,
        avg_time: 14,
        completed: 45,
        quality: 92
      },
      {
        email: 'reviewer3@amhsj.org',
        name: 'Dr. Maria Gonzalez',
        affiliation: 'University of Michigan',
        bio: 'Reviewer specializing in neurology and neurological disorders research.',
        expertise: '["neurology", "neurological_disorders", "neuroplasticity"]',
        specializations: '["neurology", "brain_research", "neurological_diseases"]',
        research_interests: '["stroke_research", "neurodegeneration", "brain_plasticity"]',
        orcid: '0000-0013-1234-5678',
        max_reviews: 3,
        avg_time: 18,
        completed: 23,
        quality: 87
      },
      {
        email: 'reviewer4@amhsj.org',
        name: 'Dr. Thomas Anderson',
        affiliation: 'Yale School of Medicine',
        bio: 'Junior reviewer with growing expertise in infectious diseases and epidemiology.',
        expertise: '["infectious_diseases", "epidemiology", "public_health"]',
        specializations: '["infectious_diseases", "epidemiology", "outbreak_investigation"]',
        research_interests: '["disease_surveillance", "outbreak_response", "vaccine_research"]',
        orcid: '0000-0014-2345-6789',
        max_reviews: 2,
        avg_time: 21,
        completed: 8,
        quality: 78
      }
    ];

    for (const reviewer of reviewers) {
      const result = await pool.query(`
        INSERT INTO users (
          id, email, name, password, role, affiliation, bio,
          expertise, is_verified, is_active, application_status,
          profile_completeness, specializations, research_interests,
          orcid, orcid_verified,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          $1, $2, $3,
          'reviewer',
          $4, $5,
          $6::jsonb,
          true, true, 'approved', 100,
          $7::jsonb,
          $8::jsonb,
          $9, true,
          NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [
        reviewer.email, reviewer.name, hashedPassword, reviewer.affiliation, reviewer.bio,
        reviewer.expertise, reviewer.specializations, reviewer.research_interests, reviewer.orcid
      ]);

      if (result.rows.length > 0) {
        await pool.query(`
          INSERT INTO reviewer_profiles (
            user_id, availability_status, max_reviews_per_month, current_review_load,
            average_review_time, completed_reviews, late_reviews, quality_score,
            last_review_date, is_active
          ) VALUES (
            $1, 'available', $2, 1, $3, $4, 0, $5,
            NOW() - INTERVAL '15 days', true
          ) ON CONFLICT (user_id) DO NOTHING
        `, [result.rows[0].id, reviewer.max_reviews, reviewer.avg_time, reviewer.completed, reviewer.quality]);
      }
    }

    console.log('✓ Reviewers created');

    // =========================================================================
    // 9. AUTHORS ROLE SETUP
    // =========================================================================
    console.log('📝 Creating Authors...');
    
    const authors = [
      {
        email: 'author1@example.org',
        name: 'Dr. Rachel Martinez',
        affiliation: 'Emory University School of Medicine',
        bio: 'Clinical researcher focusing on infectious disease prevention and vaccine development.',
        expertise: '["infectious_diseases", "vaccine_development", "clinical_trials"]',
        specializations: '["infectious_diseases", "vaccines", "clinical_research"]',
        research_interests: '["vaccine_efficacy", "disease_prevention", "clinical_trials"]',
        orcid: '0000-0015-3456-7890',
        completeness: 95
      },
      {
        email: 'author2@example.org',
        name: 'Dr. Kevin Chang',
        affiliation: 'University of Washington',
        bio: 'Early career researcher in computational biology and bioinformatics.',
        expertise: '["computational_biology", "bioinformatics", "genomics"]',
        specializations: '["bioinformatics", "computational_biology", "data_analysis"]',
        research_interests: '["genomic_analysis", "machine_learning_biology", "precision_medicine"]',
        orcid: '0000-0016-4567-8901',
        completeness: 85
      },
      {
        email: 'grad.student@example.org',
        name: 'Emily Thompson',
        affiliation: 'University of California, Berkeley',
        bio: 'Graduate student researching cancer metabolism and therapeutic targets.',
        expertise: '["cancer_metabolism", "biochemistry", "drug_discovery"]',
        specializations: '["cancer_research", "metabolism", "biochemistry"]',
        research_interests: '["cancer_metabolism", "therapeutic_targets", "drug_development"]',
        orcid: '0000-0017-5678-9012',
        completeness: 75
      }
    ];

    for (const author of authors) {
      await pool.query(`
        INSERT INTO users (
          id, email, name, password, role, affiliation, bio,
          expertise, is_verified, is_active, application_status,
          profile_completeness, specializations, research_interests,
          orcid, orcid_verified,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          $1, $2, $3,
          'author',
          $4, $5,
          $6::jsonb,
          true, true, 'approved', $7,
          $8::jsonb,
          $9::jsonb,
          $10, true,
          NOW(), NOW()
        ) ON CONFLICT (email) DO NOTHING
      `, [
        author.email, author.name, hashedPassword, author.affiliation, author.bio,
        author.expertise, author.completeness, author.specializations, 
        author.research_interests, author.orcid
      ]);
    }

    console.log('✓ Authors created');

    // =========================================================================
    // 10. CREATE SAMPLE VOLUMES AND ISSUES
    // =========================================================================
    console.log('📚 Creating sample volumes and issues...');
    
    const volumeResult = await pool.query(`
      INSERT INTO volumes (
        id, number, year, title, description, status
      ) VALUES (
        gen_random_uuid(),
        '15',
        2025,
        'Volume 15 - Advances in African Medical Research',
        'Featuring cutting-edge research from African medical institutions and international collaborations.',
        'published'
      ) ON CONFLICT DO NOTHING
      RETURNING id
    `);

    if (volumeResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO issues (
          volume_id, number, title, description, status, published_date
        ) VALUES (
          $1,
          '1',
          'Issue 1 - Cardiovascular Medicine in Africa',
          'Special focus on cardiovascular health research and interventions in African populations.',
          'published',
          NOW() - INTERVAL '30 days'
        ) ON CONFLICT DO NOTHING
      `, [volumeResult.rows[0].id]);
    }

    console.log('✓ Sample volumes and issues created');

    // =========================================================================
    // 11. GENERATE SUMMARY REPORT
    // =========================================================================
    console.log('');
    console.log('📊 Generating role summary report...');
    
    const roleReport = await pool.query(`
      SELECT 
        role,
        COUNT(*) as user_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
      FROM users 
      GROUP BY role 
      ORDER BY 
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'editor-in-chief' THEN 2
          WHEN 'managing-editor' THEN 3
          WHEN 'section-editor' THEN 4
          WHEN 'production-editor' THEN 5
          WHEN 'guest-editor' THEN 6
          WHEN 'editor' THEN 7
          WHEN 'reviewer' THEN 8
          WHEN 'author' THEN 9
          ELSE 10
        END
    `);

    console.log('');
    console.log('🎉 AMHSJ Role Setup Complete!');
    console.log('========================================');
    console.log('Role Summary:');
    roleReport.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.user_count} users (${row.active_count} active, ${row.verified_count} verified)`);
    });

    console.log('');
    console.log('🔑 Sample login credentials:');
    console.log('  Admin: admin@amhsj.org / password123');
    console.log('  EIC: eic@amhsj.org / password123');
    console.log('  Managing: managing@amhsj.org / password123');
    console.log('  Cardiology Editor: cardiology.editor@amhsj.org / password123');
    console.log('  Production: production@amhsj.org / password123');
    console.log('  Guest Editor: guest.ai@amhsj.org / password123');
    console.log('  Associate Editor: associate1@amhsj.org / password123');
    console.log('  Reviewer: reviewer1@amhsj.org / password123');
    console.log('  Author: author1@example.org / password123');
    console.log('');
    console.log('⚠️  WARNING: Change default passwords in production!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('  1. Start your application: npm run dev');
    console.log('  2. Login with any of the above credentials');
    console.log('  3. Test the role-based workflows');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up roles:', error.message);
    console.error(error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupRoles().catch((error) => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setupRoles };
