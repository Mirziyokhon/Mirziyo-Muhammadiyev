import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'
import { verifySession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const essays = await db.getEssays()
  return NextResponse.json(essays)
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const data = await request.json()
    const essay = await db.createEssay(data)
    return NextResponse.json(essay, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id, ...updates } = await request.json()
    const essay = await db.updateEssay(id, updates)
    
    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }
    
    return NextResponse.json(essay)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { id } = await request.json()
    const success = await db.deleteEssay(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}
