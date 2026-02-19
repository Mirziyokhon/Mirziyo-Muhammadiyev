import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'

export async function GET(request: NextRequest) {
  try {
    const projects = await db.getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
