import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function POST(request: NextRequest) {
  try {
    const { postId, type } = await request.json()
    
    if (!postId || !type || !['heart', 'dove', 'brokenHeart'].includes(type)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    
    // Get user identifier (IP address or generate session ID)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userIdentifier = ip
    
    // Check if user already reacted
    if (await db.hasUserReacted(postId, userIdentifier)) {
      return NextResponse.json({ 
        error: 'You have already reacted to this post' 
      }, { status: 400 })
    }
    
    // Add reaction
    const success = await db.addReaction(postId, type, userIdentifier)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
    }
    
    const post = await db.getBlogPost(postId)
    
    return NextResponse.json({ 
      success: true,
      reactions: post?.reactions 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
