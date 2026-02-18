import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

async function getEssays() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/public/essays`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const essays = await getEssays()
  const essay = essays.find((e: any) => e.slug === slug)

  if (!essay) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
      <Link
        href="/essays"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Essays</span>
      </Link>

      <article>
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 leading-tight text-balance">{essay.title}</h1>
          <div className="flex items-center gap-3 text-muted-foreground text-sm mb-4">
            <time>{essay.date}</time>
            <span>·</span>
            <span>{essay.readingTime}</span>
          </div>
          {essay.tags && essay.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {essay.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          {essay.content.split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-6 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  )
}
