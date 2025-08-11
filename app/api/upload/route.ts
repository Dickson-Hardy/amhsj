import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadFile } from "@/lib/imagekit"
import { 
  FILE_UPLOAD_CONFIG, 
  validateFileSize, 
  validateFileType,
  validateFileCount,
  validateTotalSize 
} from "@/lib/file-upload-config"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const category = (formData.get("category") as keyof typeof FILE_UPLOAD_CONFIG.ALLOWED_FILE_TYPES) || "manuscript"
    const folder = (formData.get("folder") as string) || "articles"

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Validate file count
    const countValidation = validateFileCount(files)
    if (!countValidation.valid) {
      return NextResponse.json({ error: countValidation.message }, { status: 400 })
    }

    // Validate total size
    const sizeValidation = validateTotalSize(files)
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.message }, { status: 400 })
    }

    // Validate individual files
    const uploadResults = []
    for (const file of files) {
      // Validate file size
      const fileSizeValidation = validateFileSize(file)
      if (!fileSizeValidation.valid) {
        return NextResponse.json({ error: fileSizeValidation.message }, { status: 400 })
      }

      // Validate file type
      const fileTypeValidation = validateFileType(file, category)
      if (!fileTypeValidation.valid) {
        return NextResponse.json({ error: fileTypeValidation.message }, { status: 400 })
      }

      try {
        const result = await uploadFile(file, folder)
        uploadResults.push({
          ...result,
          originalName: file.name,
          category,
          uploadedAt: new Date().toISOString()
        })
      } catch (uploadError) {
        console.error(`Upload error for file ${file.name}:`, uploadError)
        return NextResponse.json({ 
          error: `Failed to upload file: ${file.name}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadResults,
      summary: {
        totalFiles: uploadResults.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        category
      }
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
