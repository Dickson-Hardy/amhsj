// Script to create the first admin user
import { logger } from "@/lib/logger";
import { db } from "../lib/db/index.js"
import { users } from "../lib/db/schema.js"
import bcrypt from "bcryptjs"

async function createAdmin() {
  try {
    logger.info("🔐 Creating AMHSJ Admin User...")

    const hashedPassword = await bcrypt.hash("admin123!", 12)

    const [adminUser] = await db
      .insert(users)
      .values({
        name: "AMHSJ Administrator",
        email: "admin@amhsj.org",
        password: hashedPassword,
        role: "admin",
        affiliation: "AMHSJ Editorial Office",
        isVerified: true,
        expertise: ["Journal Management", "Editorial Operations", "IoT Research"],
      })
      .returning()

    logger.info("✅ Admin user created successfully!")
    logger.info("📧 Email: admin@amhsj.org")
    logger.info("🔑 Password: admin123!")
    logger.info("⚠️  Please change the password after first login")

    return adminUser
  } catch (error) {
    logger.error("❌ Error creating admin user:", error)
    throw error
  }
}

createAdmin()
