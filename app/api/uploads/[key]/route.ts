import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@netlify/blobs'

const EXT_TO_TYPE: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
}

function getContentType(key: string): string {
  const ext = key.includes('.') ? key.slice(key.lastIndexOf('.')) : ''
  return EXT_TO_TYPE[ext.toLowerCase()] || 'application/octet-stream'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  if (!key) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only serve from Blobs on Netlify
  if (!process.env.NETLIFY && !process.env.NETLIFY_DEV) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const store = getStore({ name: 'uploads', consistency: 'strong' })
    const blob = await store.get(key, { type: 'arrayBuffer' })

    if (!blob) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const contentType = getContentType(key)
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving upload:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
