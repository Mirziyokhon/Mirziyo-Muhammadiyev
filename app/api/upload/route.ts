import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { verifySession } from '@/lib/auth'
import { getStore } from '@netlify/blobs'
import { v2 as cloudinary } from 'cloudinary'

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileType = file.type.split('/')[0]
    if (!['image', 'video'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 })
    }

    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 1. Cloudinary (most reliable, works on any host)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (cloudName && apiKey && apiSecret) {
      try {
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
        const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`
        const resourceType = fileType === 'video' ? 'video' : 'image'
        const result = await cloudinary.uploader.upload(dataUri, {
          resource_type: resourceType,
          public_id: `uploads/${filename.replace(/\.[^/.]+$/, '')}`,
          overwrite: true,
        })
        const url = result.secure_url
        console.log(`✅ File uploaded to Cloudinary: ${filename}`)
        return NextResponse.json({ success: true, url })
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr)
        return NextResponse.json({
          error: `Cloudinary error: ${getErrorMessage(cloudErr)}`,
        }, { status: 500 })
      }
    }

    // 2. Netlify Blobs (when on Netlify / serverless – filesystem is read-only)
    const isServerless = process.cwd().includes('/var/task') || process.env.NETLIFY || process.env.NETLIFY_DEV
    if (isServerless) {
      try {
        const store = getStore({ name: 'uploads', consistency: 'strong' })
        await store.set(filename, buffer)
        console.log(`✅ File uploaded to Blobs: ${filename}`)
        return NextResponse.json({ success: true, url: `/api/uploads/${filename}` })
      } catch (blobErr) {
        console.error('Netlify Blobs upload error:', blobErr)
        return NextResponse.json({
          error: `Upload failed. Add Cloudinary env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in Netlify for reliable uploads.`,
        }, { status: 500 })
      }
    }

    // 3. Local filesystem (dev only)
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, buffer)
    console.log(`✅ File uploaded: ${filename}`)
    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: `Upload failed: ${getErrorMessage(error)}`,
    }, { status: 500 })
  }
}
