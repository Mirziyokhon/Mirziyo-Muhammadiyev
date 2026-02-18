"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function QuoteOfTheDayPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/public/quotes')
      const data = await res.json()
      setQuotes(data)
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || quotes.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const currentQuote = quotes[currentIndex]

  const handlePrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === 0 ? quotes.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 700)
  }

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === quotes.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 700)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const targetIndex = Math.floor(percentage * quotes.length)
    const clampedIndex = Math.max(0, Math.min(quotes.length - 1, targetIndex))

    setIsAnimating(true)
    setCurrentIndex(clampedIndex)
    setTimeout(() => setIsAnimating(false), 700)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        {/* Quote container with animation */}
        <div
          key={currentIndex}
          className="opacity-0 translate-y-4 transition-all duration-700 ease-out"
          style={{
            animation: "fadeInUp 0.7s ease-out forwards",
          }}
        >
          {/* Quote text */}
          <blockquote className="text-center mb-12">
            <p className="text-3xl md:text-4xl lg:text-5xl font-serif leading-relaxed mb-8 text-balance">
              "{currentQuote.text}"
            </p>
            <footer className="text-lg md:text-xl text-[#8B6F47]">— {currentQuote.author}</footer>
          </blockquote>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <button
            onClick={handlePrevious}
            disabled={isAnimating}
            className="p-3 hover:bg-foreground/5 rounded-full transition-colors disabled:opacity-50"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-6 w-6 text-[#8B6F47]" />
          </button>

          <div className="text-sm text-[#8B6F47]">
            Quote {currentIndex + 1} of {quotes.length}
          </div>

          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="p-3 hover:bg-foreground/5 rounded-full transition-colors disabled:opacity-50"
            aria-label="Next quote"
          >
            <ChevronRight className="h-6 w-6 text-[#8B6F47]" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="max-w-md mx-auto">
          <div
            className="h-1 bg-foreground/5 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Quote progress"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={quotes.length}
          >
            <div
              className="h-full bg-[#8B6F47] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quotes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
