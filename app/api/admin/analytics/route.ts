import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'
import { verifySession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  
  const analytics = await db.getAnalytics(startDate, endDate)
  
  // Calculate summary statistics
  const totalViews = analytics.reduce((sum, a) => sum + a.pageViews, 0)
  const totalQuoteViews = analytics.reduce((sum, a) => sum + a.quoteViews, 0)
  
  const essays = await db.getEssays()
  const works = await db.getWorks()
  const blogPosts = await db.getBlogPosts()
  
  const totalReactions = blogPosts.reduce((sum, post) => 
    sum + post.reactions.heart + post.reactions.dove + post.reactions.brokenHeart, 0
  )
  
  return NextResponse.json({
    analytics,
    summary: {
      totalViews,
      totalQuoteViews,
      totalEssays: essays.length,
      totalWorks: works.length,
      totalBlogPosts: blogPosts.length,
      totalQuotes: await db.getQuotes().length,
      totalReactions,
      topEssays: essays.sort((a, b) => b.views - a.views).slice(0, 5),
      topWorks: works.sort((a, b) => b.views - a.views).slice(0, 5),
      topBlogPosts: blogPosts.sort((a, b) => b.views - a.views).slice(0, 5),
    }
  })
}
