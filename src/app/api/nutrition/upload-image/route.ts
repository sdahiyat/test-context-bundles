import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  }
  return mimeToExt[mimeType.toLowerCase()] || 'jpg'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, mimeType, userId } = body

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'imageBase64 is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!mimeType) {
      return NextResponse.json(
        { success: false, error: 'mimeType is required' },
        { status: 400 }
      )
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64

    const buffer = Buffer.from(base64Data, 'base64')

    // Check file size (20MB limit)
    const maxSizeBytes = 20 * 1024 * 1024
    if (buffer.length > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'Image is too large. Maximum size is 20MB.' },
        { status: 400 }
      )
    }

    const ext = getExtensionFromMimeType(mimeType)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filePath = `${userId}/${timestamp}-${random}.${ext}`

    const { data, error } = await supabaseAdmin.storage
      .from('meal-images')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      return NextResponse.json(
        { success: false, error: `Failed to upload image: ${error.message}` },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('meal-images')
      .getPublicUrl(filePath)

    const imageUrl = publicUrlData.publicUrl

    return NextResponse.json({
      success: true,
      imageUrl,
      path: filePath,
    })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to upload image. Please try again.',
      },
      { status: 500 }
    )
  }
}
