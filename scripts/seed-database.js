// Database seeding script for medical journal content
import { db } from "../lib/db/index.js"
import { users, articles } from "../lib/db/schema.js"
import { eq } from "drizzle-orm"

const medicalResearchers = [
  {
    name: "Dr. Sarah Johnson",
    email: "s.johnson@medicalresearch.edu",
    role: "author",
    affiliation: "Harvard Medical School",
    expertise: ["Clinical Medicine", "Cardiology", "Patient Care"],
    bio: "Leading researcher in cardiology and patient care with 15+ years experience",
  },
  {
    name: "Prof. Michael Chen",
    email: "m.chen@publichealth.edu",
    role: "editor",
    affiliation: "Johns Hopkins Bloomberg School of Public Health",
    expertise: ["Public Health", "Epidemiology", "Global Health"],
    bio: "Professor of Public Health specializing in large-scale health deployments",
  },
  {
    name: "Dr. Elena Rodriguez",
    email: "e.rodriguez@biomedical.org",
    role: "reviewer",
    affiliation: "National Institutes of Health",
    expertise: ["Biomedical Sciences", "Medical Research", "Laboratory Medicine"],
    bio: "Biomedical researcher focused on medical advancements",
  },
]

const medicalArticles = [
  {
    title: "Clinical Outcomes of Novel Cardiac Intervention Techniques: A Comprehensive Analysis",
    abstract:
      "This paper presents a detailed analysis of novel cardiac intervention techniques. We evaluate patient outcomes, recovery times, and long-term efficacy across different treatment modalities, demonstrating significant improvements in cardiovascular health.",
    keywords: ["Clinical Research", "Cardiology", "Patient Care", "Medical Devices", "Clinical Trials"],
    category: "Clinical Medicine",
    status: "published",
    volume: "Vol. 15",
    issue: "Issue 3",
    pages: "45-67",
    doi: "10.1234/amhsj.2024.15.3.001",
  },
  {
    title: "Blockchain-Secured Patient Data Management in Healthcare Systems",
    abstract:
      "We propose a novel blockchain-based framework for managing patient data in healthcare systems, addressing security and privacy concerns. Our solution provides decentralized data management while maintaining HIPAA compliance and ensuring patient data privacy.",
    keywords: ["Blockchain", "Healthcare Technology", "Data Management", "Security", "Privacy"],
    category: "Healthcare Technology",
    status: "published",
    volume: "Vol. 15",
    issue: "Issue 2",
    pages: "23-41",
    doi: "10.1234/amhsj.2024.15.2.002",
  },
  {
    title: "Public Health Infrastructure: Scalable Disease Surveillance Networks for Global Health Monitoring",
    abstract:
      "This research presents a scalable architecture for deploying disease surveillance networks across global environments. We demonstrate real-world implementations for tracking infectious diseases, monitoring outbreaks, and improving public health outcomes.",
    keywords: ["Public Health", "Epidemiology", "Global Health", "Disease Surveillance", "Healthcare Innovation"],
    category: "Public Health",
    status: "under_review",
    volume: "Vol. 15",
    issue: "Issue 4",
    doi: "10.1234/amhsj.2024.15.4.003",
  },
]

async function seedDatabase() {
  try {
    console.log("🌱 Seeding AMHSJ Medical Research Database...")

    // Insert researchers
    console.log("👥 Adding medical researchers...")
    const insertedUsers = await db.insert(users).values(medicalResearchers).returning()
    console.log(`✅ Added ${insertedUsers.length} researchers`)

    // Insert medical articles
    console.log("📄 Adding medical research articles...")
    const articlesWithAuthors = medicalArticles.map((article, index) => ({
      ...article,
      authorId: insertedUsers[index % insertedUsers.length].id,
      submittedDate: new Date(2024, index, 15),
      publishedDate: article.status === "published" ? new Date(2024, index + 1, 1) : null,
      views: Math.floor(Math.random() * 5000) + 1000,
      downloads: Math.floor(Math.random() * 2000) + 500,
    }))

    const insertedArticles = await db.insert(articles).values(articlesWithAuthors).returning()
    console.log(`✅ Added ${insertedArticles.length} medical research articles`)

    console.log("🎉 AMHSJ database seeded successfully!")
    console.log("📊 Database now contains:")
    console.log(`   - ${insertedUsers.length} medical researchers`)
    console.log(`   - ${insertedArticles.length} research articles`)
    console.log("   - Focus: 50% medical research content")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

seedDatabase()
