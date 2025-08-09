import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { desc, ilike, eq } from "drizzle-orm"
import { logError } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = db.select().from(users)

    if (search) {
      query = query.where(ilike(users.name, `%${search}%`))
    }

    if (role && role !== "all") {
      query = query.where(eq(users.role, role))
    }

    const userList = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset)

    // Remove sensitive data
    const sanitizedUsers = userList.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/admin/users" })
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}
