import { NextRequest, NextResponse } from 'next/server'
import { db as fileDb } from '@/lib/db'
import { dbPostgres } from '@/lib/db-postgres'
import { verifySession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get data from file-based database
    const essays = await fileDb.getEssays()
    const works = await fileDb.getWorks()
    
    // Migrate essays
    for (const essay of essays) {
      await dbPostgres.createEssay({
        title: essay.title,
        slug: essay.slug,
        content: essay.content,
        summary: essay.summary,
        date: essay.date,
        readingTime: essay.readingTime,
        tags: essay.tags
      })
    }

    // Migrate works
    for (const work of works) {
      await dbPostgres.createWork({
        title: work.title,
        slug: work.slug,
        content: work.content,
        image: work.image,
        date: work.date
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${essays.length} essays and ${works.length} works` 
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
