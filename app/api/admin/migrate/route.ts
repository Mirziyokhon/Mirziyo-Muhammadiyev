import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-wrapper'
import { verifySession } from '@/lib/auth'

// Sample data to migrate (you can paste your actual data here)
const MIGRATION_DATA = {
  essays: [
    {
      id: "1762444336751",
      title: "Illusion or Awareness? Rethinking Consciousness in Artificial Intelligence",
      slug: "illusion-or-awareness-rethinking-consciousness-in-artificial-intelligence",
      content: `<p>The possibility of artificial intelligence achieving consciousness has long fascinated and alarmed people worldwide, as shown by the popularity of films such as <em>The Matrix</em> and <em>Terminator</em>. Yet the deeper philosophical question remains: if machines claimed awareness, how could we distinguish genuine consciousness from mere algorithmic simulations, and does this distinction even matter? This essay explores the possible methods of artificial consciousness identification, addresses whether machines can acquire a genuine human-like consciousness, and considers why the distinction matters ethically, analyzing <em>Consciousness in Artificial Intelligence</em> (Butlin et al., 2023) and other works.</p>`,
      summary: "",
      date: "October 10, 2025",
      readingTime: "",
      tags: ["Academic", "Philosophy"]
    }
  ],
  works: [
    {
      id: "1762446505201",
      title: "The Impact of Educational Policies on Wealth Inequality and Unequal Access to Education",
      slug: "the-impact-of-educational-policies",
      content: `<p><strong><em>Abstract</em></strong></p><p>This study investigates how educational policies affect equal education opportunities and wealth inequality rates within densely populated developing countries, such as Uzbekistan.</p>`,
      image: "",
      date: "June, 2025"
    }
  ],
  blogPosts: [
    {
      id: "1762448569298",
      title: "Central Asian BP Debate Championship!",
      slug: "central-asian-bp-debate-championship",
      content: `<p>Accumulating confidence and pride from being "knowledgeable" and "experienced" in debates, I decided to register for the "Central Asian Youth Vision 2025" British Parliamentary style debate competition.</p>`,
      image: "/uploads/1762448693209-photo_2025-06-12_22-57-50.jpg",
      date: "June 27, 2025",
      linkedInUrl: ""
    }
  ],
  quotes: [
    { id: "1762445606170", text: "Money won't make you happy, but you will probably be unhappy without it.", author: "Mirziyo Muhammadiyev" },
    { id: "1762445848466", text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
    { id: "1762446037143", text: "You've gotta dance like there's nobody watching,\nLove like you'll never be hurt,\nSing like there's nobody listening,\nAnd live like it's heaven on earth.", author: "William W. Purkey" },
    { id: "1762446150260", text: "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.", author: " Martin Luther King Jr." }
  ]
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || null
  
  if (!verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const results = {
      essays: 0,
      works: 0,
      blogPosts: 0,
      quotes: 0,
      errors: [] as string[]
    }

    // Migrate Essays
    for (const essay of MIGRATION_DATA.essays) {
      try {
        await db.createEssay(essay as any)
        results.essays++
      } catch (error: any) {
        results.errors.push(`Essay: ${error.message}`)
      }
    }

    // Migrate Works
    for (const work of MIGRATION_DATA.works) {
      try {
        await db.createWork(work as any)
        results.works++
      } catch (error: any) {
        results.errors.push(`Work: ${error.message}`)
      }
    }

    // Migrate Blog Posts
    for (const post of MIGRATION_DATA.blogPosts) {
      try {
        await db.createBlogPost(post as any)
        results.blogPosts++
      } catch (error: any) {
        results.errors.push(`Blog: ${error.message}`)
      }
    }

    // Migrate Quotes
    for (const quote of MIGRATION_DATA.quotes) {
      try {
        await db.createQuote(quote as any)
        results.quotes++
      } catch (error: any) {
        results.errors.push(`Quote: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 })
  }
}
