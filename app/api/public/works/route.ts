import { NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET() {
  const works = await db.getWorks()
  return NextResponse.json(works)
}
