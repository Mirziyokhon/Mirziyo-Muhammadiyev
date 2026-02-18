import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'
import { verifySession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await db.getBlogPosts())
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const data = await request.json()
    const post = await db.createBlogPost(data)
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, ...updates } = await request.json()
    const post = await db.updateBlogPost(id, updates)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await request.json()
    const success = await db.deleteBlogPost(id)
    if (!success) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}
