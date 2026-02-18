import { NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET() {
  const essays = await db.getEssays()
  return NextResponse.json(essays)
}
