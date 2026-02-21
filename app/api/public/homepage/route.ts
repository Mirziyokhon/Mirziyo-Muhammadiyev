import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET(request: NextRequest) {
  try {
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
