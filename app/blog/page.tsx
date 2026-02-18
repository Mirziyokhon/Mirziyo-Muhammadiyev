"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reactingTo, setReactingTo] = useState<string | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPosts()
    // Load user reactions from localStorage
    const saved = localStorage.getItem('userReactions')
    if (saved) {
      setUserReactions(JSON.parse(saved))
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/public/blog')
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (postId: string, type: 'heart' | 'dove' | 'brokenHeart') => {
    if (reactingTo) return
    
    const currentReaction = userReactions[postId]
    
    // If clicking the same reaction, remove it
    if (currentReaction === type) {
      // Remove reaction
      const post = posts.find(p => p.id === postId)
      if (post && post.reactions) {
        const updatedPosts = posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              reactions: {
                ...p.reactions,
                [type]: Math.max(0, p.reactions[type] - 1)
              }
            }
          }
          return p
        })
        setPosts(updatedPosts)
        
        const newReactions = { ...userReactions }
        delete newReactions[postId]
        setUserReactions(newReactions)
        localStorage.setItem('userReactions', JSON.stringify(newReactions))
      }
      return
    }
    
    // If changing reaction, update counts
    if (currentReaction) {
      const post = posts.find(p => p.id === postId)
      if (post && post.reactions) {
        const updatedPosts = posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              reactions: {
                ...p.reactions,
                [currentReaction]: Math.max(0, p.reactions[currentReaction] - 1),
                [type]: p.reactions[type] + 1
              }
            }
          }
          return p
        })
        setPosts(updatedPosts)
        
        const newReactions = { ...userReactions, [postId]: type }
        setUserReactions(newReactions)
        localStorage.setItem('userReactions', JSON.stringify(newReactions))
      }
      return
    }
    
    // New reaction
    setReactingTo(postId)
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Update local state
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, reactions: data.reactions } : p
        ))
        
        // Save user reaction to localStorage
        const newReactions = { ...userReactions, [postId]: type }
        setUserReactions(newReactions)
        localStorage.setItem('userReactions', JSON.stringify(newReactions))
      } else {
        alert(data.error || 'Failed to add reaction')
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
      alert('Failed to add reaction')
    } finally {
      setReactingTo(null)
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-20 text-center">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
      <header className="mb-16">
        <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight text-balance">Blog</h1>
        <p className="text-xl text-[#8B6F47]">
          Thoughts, observations, and reflections from my LinkedIn posts.
        </p>
      </header>

      <div className="space-y-4">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Post Header - Title and Date */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex-1">
                  {post.title}
                </h2>
                {post.linkedInUrl && (
                  <a
                    href={post.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                    title="View on LinkedIn"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{post.date}</p>
            </div>

            {/* Post Image/Video */}
            {post.image && (
              <div className="relative w-full bg-zinc-100 dark:bg-zinc-800">
                {post.image.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video 
                    src={post.image} 
                    controls 
                    className="w-full max-h-[500px] object-contain"
                  />
                ) : (
                  <div className="relative w-full h-80">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
              </div>
            )}

            {/* Post Content */}
            <div className="px-3 py-3">
              <div 
                className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-[#8B6F47] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Reactions Bar - Telegram Style */}
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleReaction(post.id, 'heart')}
                  disabled={reactingTo === post.id}
                  className={`
                    group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                    transition-all duration-200 text-xs font-medium cursor-pointer
                    ${userReactions[post.id] === 'heart' 
                      ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-700' 
                      : 'bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="text-base">❤️</span>
                  <span>{post.reactions?.heart || 0}</span>
                </button>
                
                <button
                  onClick={() => handleReaction(post.id, 'dove')}
                  disabled={reactingTo === post.id}
                  className={`
                    group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                    transition-all duration-200 text-xs font-medium cursor-pointer
                    ${userReactions[post.id] === 'dove' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-700' 
                      : 'bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-600 dark:text-zinc-400 hover:text-blue-600'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="text-base">🕊️</span>
                  <span>{post.reactions?.dove || 0}</span>
                </button>
                
                <button
                  onClick={() => handleReaction(post.id, 'brokenHeart')}
                  disabled={reactingTo === post.id}
                  className={`
                    group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                    transition-all duration-200 text-xs font-medium cursor-pointer
                    ${userReactions[post.id] === 'brokenHeart' 
                      ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-700' 
                      : 'bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className="text-base">💔</span>
                  <span>{post.reactions?.brokenHeart || 0}</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
