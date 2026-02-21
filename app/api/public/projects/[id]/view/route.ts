import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.trackPageView('project', params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
