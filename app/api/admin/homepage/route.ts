import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'
import { verifySession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get homepage content from database or return default
    const homepage = await db.getHomepage()
    return NextResponse.json(homepage || {
      title: "Mirziyo Muhammadiyev",
      subtitle: "What's up?",
      description: "I'm a passionate developer and creative thinker who loves building innovative solutions. Welcome to my digital space where I share my thoughts, projects, and experiences."
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch homepage content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const homepage = await db.updateHomepage(data)
    return NextResponse.json(homepage)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update homepage content' }, { status: 500 })
  }
}
