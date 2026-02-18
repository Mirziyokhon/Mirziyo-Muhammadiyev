import Link from "next/link"
import { db } from '@/lib/db-wrapper'

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function WorksPage() {
  const allWorks = await db.getWorks()

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
      <header className="mb-16">
        <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight text-balance">Academic Works</h1>
        <p className="text-xl text-muted-foreground">
          Research papers, publications, and academic contributions exploring philosophy, cognition, and human
          understanding.
        </p>
      </header>

      <div className="space-y-3">
        {allWorks.map((work: any) => (
          <Link
            key={work.id}
            href={`/works/${work.slug}`}
            className="block text-lg hover:underline underline-offset-4 decoration-1 transition-all"
          >
            {work.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
