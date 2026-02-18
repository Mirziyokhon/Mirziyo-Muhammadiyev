import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const essay = await db.getEssay(id)
  
  if (!essay) {
    return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
  }
  
  return NextResponse.json(essay)
}
