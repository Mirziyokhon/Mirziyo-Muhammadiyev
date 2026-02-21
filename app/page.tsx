"use client"

import Image from "next/image"
import { Mail, Linkedin, Send, Instagram, Copy, Check } from "lucide-react"
import { XLogo } from "@/components/XLogo"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [copied, setCopied] = useState(false)
  const [homepage, setHomepage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const email = "mirziyoqwerty@gmail.com"

  useEffect(() => {
    fetchHomepage()
  }, [])

  const fetchHomepage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/public/homepage')
      const data = await response.json()
      setHomepage(data)
    } catch (error) {
      console.error('Failed to fetch homepage:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
      {/* Header with circular photo */}
      <header className="mb-16">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-full overflow-hidden border-4 border-[#8B6F47]/20">
            <Image
              src="/DSC03575.JPG"
              alt="Mirziyo Muhammadiyev"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-2 leading-tight">
              {homepage?.title || "Mirziyo Muhammadiyev"}
            </h1>
            <p className="text-xl text-[#8B6F47]">{homepage?.subtitle || "What's up?"}</p>
          </div>
        </div>
      </header>

      {/* About section */}
      <section className="prose prose-lg max-w-none mb-20">
        {loading ? (
          <div className="text-lg leading-relaxed whitespace-pre-wrap">
            Loading...
          </div>
        ) : (
          <div className="text-lg leading-relaxed whitespace-pre-wrap">
            {homepage?.description || `I'm Mirziyo. I build things that matter, ask uncomfortable questions, and refuse to stay in one box.

What I do: Research at the intersection of code and cognition. Build EdTech products that shape education. Investigate how computational tools expose patterns human perception misses—emotion recognition in classrooms, algorithmic bias in learning systems, whether technology augments or replaces human judgment.

Fields of interest: CS. Psychology. Cognitive Science. Ethics, Politics, Economics.

Who I am offline: Teacher and a student. Full-time overthinker. A supportive friend or a colleague. That one delusional guy. And a person that questions everything, including why I question everything.

Hobbies: Music. Basketball. Creative Writing. Debate. Videography and Films. Philosophy. Fashion.

What this site is: Not a portfolio. Not a personal brand. Repository for ideas that don't fit elsewhere. Writing that's too raw for papers, too long for posts, too honest for performative platforms. If you're reading this, you either know me or you're procrastinating. Either way—welcome.

Contact: If you want to debate ideas, collaborate on projects, or tell me I'm wrong about something. Feel free to reach out.`}
          </div>
        )}
      </section>

      {/* Contact section */}
      <section className="border-t border-border pt-12 mt-20">
        <h2 className="font-heading text-2xl font-semibold mb-6">Contact</h2>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowEmailPopup(true)}
            className="text-[#8B6F47] hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="Email"
          >
            <Mail className="w-6 h-6" />
          </button>
          <a
            href="https://www.linkedin.com/in/mirziyo-muhammadiyev-a1170626b/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B6F47] hover:opacity-70 transition-opacity"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-6 h-6" />
          </a>
          <a
            href="https://t.me/mmb_020"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B6F47] hover:opacity-70 transition-opacity"
            aria-label="Telegram"
          >
            <Send className="w-6 h-6" />
          </a>
          <a
            href="https://www.instagram.com/mirziyokhon/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B6F47] hover:opacity-70 transition-opacity"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://x.com/Mirziyokhon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B6F47] hover:opacity-70 transition-opacity"
            aria-label="X (Twitter)"
          >
            <XLogo className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Email popup */}
      {showEmailPopup && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEmailPopup(false)}
        >
          <div 
            className="bg-background border border-border rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-xl font-semibold mb-4">Email Address</h3>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={email}
                readOnly
                className="flex-1 px-4 py-2 bg-muted/30 border border-border rounded text-sm"
              />
              <button
                onClick={handleCopyEmail}
                className="px-4 py-2 bg-[#8B6F47] text-white rounded hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => setShowEmailPopup(false)}
              className="w-full px-4 py-2 border border-border rounded hover:bg-muted/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
