import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { db } from "@/lib/db-wrapper"

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const works = await db.getWorks()
  const work = works.find((w: any) => w.slug === slug)

  if (!work) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
      <Link
        href="/works"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Works</span>
      </Link>

      <article>
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight text-balance">{work.title}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{work.date}</span>
          </div>
        </header>

        {work.image && (
          <div className="relative w-full h-96 mb-12 rounded-lg overflow-hidden">
            <Image src={work.image} alt={work.title} fill className="object-cover" />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-[#8B6F47] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
          dangerouslySetInnerHTML={{ __html: work.content }}
        />
      </article>
    </div>
  )
}
