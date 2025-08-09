import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

// Mock data - replace with database implementation
let advertisements = [
  {
    id: "1",
    title: "Medical Equipment Advertisement",
    imageUrl: "/api/placeholder/300/250",
    targetUrl: "https://example.com",
    position: "sidebar-top",
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  },
  {
    id: "2",
    title: "Sponsor Banner",
    imageUrl: "/api/placeholder/300/200",
    targetUrl: "https://sponsor.com",
    position: "sidebar-bottom",
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
  },
]

// GET /api/admin/advertisements - Get all advertisements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")
    const activeOnly = searchParams.get("active") === "true"

    let filteredAds = [...advertisements]

    if (position) {
      filteredAds = filteredAds.filter(ad => ad.position === position)
    }

    if (activeOnly) {
      filteredAds = filteredAds.filter(ad => 
        ad.isActive && new Date(ad.expiresAt) > new Date()
      )
    }

    return NextResponse.json({
      success: true,
      advertisements: filteredAds,
    })
  } catch (error) {
    console.error("Error fetching advertisements:", error)
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    )
  }
}

// POST /api/admin/advertisements - Create new advertisement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, imageUrl, targetUrl, position, expiresAt } = body

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const newAd = {
      id: Date.now().toString(),
      title,
      imageUrl,
      targetUrl,
      position,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    advertisements.push(newAd)

    return NextResponse.json({
      success: true,
      advertisement: newAd,
    })
  } catch (error) {
    console.error("Error creating advertisement:", error)
    return NextResponse.json(
      { error: "Failed to create advertisement" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/advertisements - Update advertisement
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, imageUrl, targetUrl, position, isActive, expiresAt } = body

    if (!id) {
      return NextResponse.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      )
    }

    const adIndex = advertisements.findIndex(ad => ad.id === id)
    if (adIndex === -1) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    advertisements[adIndex] = {
      ...advertisements[adIndex],
      title: title || advertisements[adIndex].title,
      imageUrl: imageUrl || advertisements[adIndex].imageUrl,
      targetUrl: targetUrl || advertisements[adIndex].targetUrl,
      position: position || advertisements[adIndex].position,
      isActive: isActive !== undefined ? isActive : advertisements[adIndex].isActive,
      expiresAt: expiresAt || advertisements[adIndex].expiresAt,
    }

    return NextResponse.json({
      success: true,
      advertisement: advertisements[adIndex],
    })
  } catch (error) {
    console.error("Error updating advertisement:", error)
    return NextResponse.json(
      { error: "Failed to update advertisement" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/advertisements - Delete advertisement
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      )
    }

    const adIndex = advertisements.findIndex(ad => ad.id === id)
    if (adIndex === -1) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    advertisements.splice(adIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Advertisement deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting advertisement:", error)
    return NextResponse.json(
      { error: "Failed to delete advertisement" },
      { status: 500 }
    )
  }
}
