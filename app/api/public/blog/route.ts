import { NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET() {
  const posts = await db.getBlogPosts()
  return NextResponse.json(posts)
}
