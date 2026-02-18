import { NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET() {
  const quotes = await db.getQuotes()
  return NextResponse.json(quotes)
}
