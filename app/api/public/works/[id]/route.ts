import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const work = await db.getWork(id)
  
  if (!work) {
    return NextResponse.json({ error: 'Work not found' }, { status: 404 })
  }
  
  return NextResponse.json(work)
}
