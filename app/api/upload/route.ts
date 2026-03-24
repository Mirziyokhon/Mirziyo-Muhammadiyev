import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { verifySession } from '@/lib/auth'
import { getStore } from '@netlify/blobs'

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    const fileType = file.type.split('/')[0]
    if (!['image', 'video'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and videos are allowed.' }, { status: 400 })
    }
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 })
    }
    
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Use Netlify Blobs on Netlify (ephemeral filesystem doesn't persist writes)
    if (process.env.NETLIFY || process.env.NETLIFY_DEV) {
      const store = getStore({ name: 'uploads', consistency: 'strong' })
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await store.set(filename, buffer, { metadata: { type: file.type } })
      console.log(`✅ File uploaded to Blobs: ${filename} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      return NextResponse.json({ 
        success: true, 
        url: `/api/uploads/${filename}` 
      })
    }
    
    // Local development: use filesystem
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    const path = join(uploadsDir, filename)
    await writeFile(path, buffer)
    console.log(`✅ File uploaded: ${filename} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
