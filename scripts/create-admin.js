// Script to create the first admin user
import { db } from "../lib/db/index.js"
import { users } from "../lib/db/schema.js"
import bcrypt from "bcryptjs"

async function createAdmin() {
  try {
    console.log("🔐 Creating AMHSJ Admin User...")

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

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@amhsj.org")
    console.log("🔑 Password: admin123!")
    console.log("⚠️  Please change the password after first login")

    return adminUser
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    throw error
  }
}

createAdmin()
