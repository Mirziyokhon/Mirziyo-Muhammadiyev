import Link from "next/link"
import { db } from '@/lib/db-wrapper'

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EssaysPage() {
  const essays = await db.getEssays()

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
      <header className="mb-16">
        <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight text-balance">Essays</h1>
        <p className="text-xl text-[#8B6F47]">
          Long-form explorations of ideas that matter—philosophy, technology, creativity, and the human condition.
        </p>
      </header>

      <div className="space-y-3">
        {essays.map((essay: any) => (
          <Link key={essay.slug} href={`/essays/${essay.slug}`} className="block group">
            <p className="text-lg hover:underline decoration-1 underline-offset-2">{essay.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
