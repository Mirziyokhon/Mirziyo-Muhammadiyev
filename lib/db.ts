// File-based database with auto-save
// In production, replace with a real database (PostgreSQL, MongoDB, etc.)

import { loadData, saveData, StorageData } from './storage'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface Essay {
  id: string
  title: string
  slug: string
  content: string
  summary: string
  date: string
  readingTime: string
  tags: string[]
  views: number
  createdAt: string
  updatedAt: string
}

export interface Work {
  id: string
  title: string
  slug: string
  content: string
  image?: string
  date: string
  views: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  company?: string
  date: string
  image?: string
  technologies: string[]
  link?: string
  views: number
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  image?: string
  date: string
  linkedInUrl?: string
  reactions: {
    heart: number
    dove: number
    brokenHeart: number
  }
  views: number
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  text: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface Reaction {
  postId: string
  type: 'heart' | 'dove' | 'brokenHeart'
  userIdentifier: string // IP or session ID
  createdAt: string
}

export interface Analytics {
  date: string
  pageViews: number
  uniqueVisitors: number
  essayViews: { [key: string]: number }
  workViews: { [key: string]: number }
  blogViews: { [key: string]: number }
  quoteViews: number
}

// In-memory storage (replace with real database)
class Database {
  private essays: Map<string, Essay> = new Map()
  private works: Map<string, Work> = new Map()
  private projects: Map<string, Project> = new Map()
  private blogPosts: Map<string, BlogPost> = new Map()
  private quotes: Map<string, Quote> = new Map()
  private reactions: Reaction[] = []
  private analytics: Analytics[] = []

  constructor() {
    try {
      this.loadFromFile()
    } catch (error) {
      console.error('❌ Error in constructor:', error)
      // Initialize with default data if loading fails
      this.initializeData()
    }
  }

  private loadFromFile() {
    try {
      const data = loadData()
      
      if (data) {
        // Load existing data
        data.essays.forEach(essay => this.essays.set(essay.id, essay))
        data.works.forEach(work => this.works.set(work.id, work))
        data.blogPosts.forEach(post => this.blogPosts.set(post.id, post))
        data.quotes.forEach(quote => this.quotes.set(quote.id, quote))
        this.reactions = data.reactions || []
        this.analytics = data.analytics || []
        console.log('✅ Database loaded from file:', {
          essays: data.essays.length,
          works: data.works.length,
          blogPosts: data.blogPosts.length,
          quotes: data.quotes.length
        })
      } else {
        // Initialize with default data only if file doesn't exist
        console.log('📝 Initializing database with default data...')
        this.initializeData()
        try {
          this.saveToFile()
        } catch (saveError) {
          console.log('⚠️ Cannot save to file (read-only environment)')
        }
      }
    } catch (error) {
      console.error('❌ Error loading database:', error)
      this.initializeData()
    }
  }

  private saveToFile() {
    const data: StorageData = {
      essays: Array.from(this.essays.values()),
      works: Array.from(this.works.values()),
      blogPosts: Array.from(this.blogPosts.values()),
      quotes: Array.from(this.quotes.values()),
      reactions: this.reactions,
      analytics: this.analytics,
    }
    
    saveData(data)
    console.log('💾 Database saved to file')
  }

  private initializeData() {
    // Initialize existing essays
    const existingEssays = [
      {
        slug: "on-simplicity",
        title: "On Simplicity and Clarity",
        date: "March 15, 2024",
        readingTime: "5 min read",
        summary: "Exploring how simplicity in thought and expression leads to deeper understanding and more meaningful communication. When we strip away the unnecessary, what remains is often more powerful than what we started with.",
        content: "Exploring how simplicity in thought and expression leads to deeper understanding and more meaningful communication. When we strip away the unnecessary, what remains is often more powerful than what we started with.",
        tags: ["Philosophy", "Writing", "Minimalism"],
      },
      {
        slug: "the-nature-of-creativity",
        title: "The Nature of Creativity",
        date: "February 28, 2024",
        readingTime: "8 min read",
        summary: "An examination of what it means to create, and how constraints can paradoxically enhance creative freedom. True creativity emerges not from unlimited possibilities, but from thoughtful limitations.",
        content: "An examination of what it means to create, and how constraints can paradoxically enhance creative freedom. True creativity emerges not from unlimited possibilities, but from thoughtful limitations.",
        tags: ["Creativity", "Philosophy", "Art"],
      },
      {
        slug: "digital-minimalism",
        title: "Digital Minimalism in Practice",
        date: "February 10, 2024",
        readingTime: "6 min read",
        summary: "Practical approaches to reducing digital clutter and reclaiming attention in an age of constant connectivity. The goal is not to reject technology, but to use it intentionally.",
        content: "Practical approaches to reducing digital clutter and reclaiming attention in an age of constant connectivity. The goal is not to reject technology, but to use it intentionally.",
        tags: ["Technology", "Minimalism", "Productivity"],
      },
      {
        slug: "on-reading",
        title: "On Reading and Understanding",
        date: "January 22, 2024",
        readingTime: "7 min read",
        summary: "Reading is not merely consuming words—it's an active dialogue with ideas across time. How we read shapes how we think, and ultimately, who we become.",
        content: "Reading is not merely consuming words—it's an active dialogue with ideas across time. How we read shapes how we think, and ultimately, who we become.",
        tags: ["Reading", "Learning", "Philosophy"],
      },
      {
        slug: "the-examined-life",
        title: "The Examined Life in Modern Times",
        date: "January 5, 2024",
        readingTime: "9 min read",
        summary: "Socrates said the unexamined life is not worth living. But what does examination mean in an age of information overload and constant distraction? A meditation on self-reflection.",
        content: "Socrates said the unexamined life is not worth living. But what does examination mean in an age of information overload and constant distraction? A meditation on self-reflection.",
        tags: ["Philosophy", "Self-Improvement", "Ancient Wisdom"],
      },
    ]

    existingEssays.forEach((essay, index) => {
      const newEssay: Essay = {
        ...essay,
        id: `essay-${index + 1}`,
        views: 0,
        createdAt: new Date(essay.date).toISOString(),
        updatedAt: new Date(essay.date).toISOString(),
      }
      this.essays.set(newEssay.id, newEssay)
    })

    // Initialize existing works
    const existingWorks = [
      { slug: "cognitive-frameworks-digital-minimalism", title: "Cognitive Frameworks for Understanding Digital Minimalism" },
      { slug: "epistemology-of-simplicity", title: "The Epistemology of Simplicity: Knowledge Through Reduction" },
      { slug: "attention-economics-ethics-design", title: "Attention Economics and the Ethics of Design" },
      { slug: "creativity-under-constraint", title: "Creativity Under Constraint: A Philosophical Analysis" },
      { slug: "phenomenology-reading-digital-age", title: "The Phenomenology of Reading in the Digital Age" },
      { slug: "digital-minimalism-human-flourishing", title: "Digital Minimalism and Human Flourishing" },
      { slug: "simplicity-epistemic-virtue", title: "Simplicity as Epistemic Virtue" },
      { slug: "ethics-attention-digital-design", title: "The Ethics of Attention in Digital Design" },
      { slug: "constraint-creativity-philosophical", title: "Constraint and Creativity: A Philosophical Perspective" },
    ]

    existingWorks.forEach((work, index) => {
      const newWork: Work = {
        ...work,
        id: `work-${index + 1}`,
        content: `Academic work on ${work.title}`,
        date: "2024",
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.works.set(newWork.id, newWork)
    })

    // Initialize existing blog posts
    const existingBlogPosts = [
      {
        date: "March 20, 2024",
        title: "LinkedIn Post - March 20",
        content: "Your LinkedIn post content will appear here. You can embed the actual LinkedIn post iframe or display the text content.",
        linkedInUrl: "https://linkedin.com/posts/your-post-url",
      },
      {
        date: "March 15, 2024",
        title: "LinkedIn Post - March 15",
        content: "Another LinkedIn post content. Replace this with your actual post text or embed code.",
        linkedInUrl: "https://linkedin.com/posts/your-post-url",
      },
      {
        date: "March 10, 2024",
        title: "LinkedIn Post - March 10",
        content: "More LinkedIn content here. You can add as many posts as you want.",
        linkedInUrl: "https://linkedin.com/posts/your-post-url",
      },
    ]

    existingBlogPosts.forEach((post, index) => {
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const newPost: BlogPost = {
        ...post,
        id: `blog-${index + 1}`,
        slug: slug,
        views: 0,
        reactions: { heart: 0, dove: 0, brokenHeart: 0 },
        createdAt: new Date(post.date).toISOString(),
        updatedAt: new Date(post.date).toISOString(),
      }
      this.blogPosts.set(newPost.id, newPost)
    })

    // Initialize existing quotes
    const existingQuotes = [
      { text: "The unexamined life is not worth living.", author: "Socrates" },
      { text: "I would have written a shorter letter, but I did not have the time.", author: "Blaise Pascal" },
      { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
      { text: "The sculptor produces the beautiful statue by chipping away such parts of the marble block as are not needed—it is a process of elimination.", author: "Elbert Hubbard" },
      { text: "Inspiration is for amateurs. The rest of us just show up and get to work.", author: "Chuck Close" },
      { text: "The ability to simplify means to eliminate the unnecessary so that the necessary may speak.", author: "Hans Hofmann" },
      { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
      { text: "The most valuable thing you can make is a mistake—you can't learn anything from being perfect.", author: "Adam Osborne" },
      { text: "Technology is nothing. What's important is that you have a faith in people, that they're basically good and smart, and if you give them tools, they'll do wonderful things with them.", author: "Steve Jobs" },
      { text: "The writer who breeds more words than he needs, is making a chore for the reader who reads.", author: "Dr. Seuss" },
      { text: "In character, in manner, in style, in all things, the supreme excellence is simplicity.", author: "Henry Wadsworth Longfellow" },
      { text: "Creativity is just connecting things. When you ask creative people how they did something, they feel a little guilty because they didn't really do it, they just saw something.", author: "Steve Jobs" },
      { text: "The first draft of anything is garbage.", author: "Ernest Hemingway" },
      { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
      { text: "The cure for boredom is curiosity. There is no cure for curiosity.", author: "Dorothy Parker" },
      { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
      { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
      { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "In the beginner's mind there are many possibilities, but in the expert's there are few.", author: "Shunryu Suzuki" },
    ]

    existingQuotes.forEach((quote, index) => {
      const newQuote: Quote = {
        ...quote,
        id: `quote-${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.quotes.set(newQuote.id, newQuote)
    })
  }

  // Essays
  getEssays(): Essay[] {
    return Array.from(this.essays.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getEssay(id: string): Essay | undefined {
    return this.essays.get(id)
  }

  createEssay(essay: Omit<Essay, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Essay {
    const newEssay: Essay = {
      ...essay,
      id: Date.now().toString(),
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.essays.set(newEssay.id, newEssay)
    this.saveToFile()
    return newEssay
  }

  updateEssay(id: string, updates: Partial<Essay>): Essay | undefined {
    const essay = this.essays.get(id)
    if (!essay) return undefined
    
    const updated = {
      ...essay,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.essays.set(id, updated)
    this.saveToFile()
    return updated
  }

  async deleteEssay(id: string): Promise<boolean> {
    const essay = this.essays.get(id)
    if (!essay) return false
    
    // Delete associated media files from content
    await this.deleteMediaFiles(undefined, essay.content)
    
    const result = this.essays.delete(id)
    if (result) this.saveToFile()
    return result
  }

  // Works
  getWorks(): Work[] {
    return Array.from(this.works.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getWork(id: string): Work | undefined {
    return this.works.get(id)
  }

  // Projects
  getProjects(): Project[] {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  createWork(work: Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Work {
    const newWork: Work = {
      ...work,
      id: Date.now().toString(),
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.works.set(newWork.id, newWork)
    this.saveToFile()
    return newWork
  }

  updateWork(id: string, updates: Partial<Work>): Work | undefined {
    const work = this.works.get(id)
    if (!work) return undefined
    
    const updated = {
      ...work,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.works.set(id, updated)
    this.saveToFile()
    return updated
  }

  async deleteWork(id: string): Promise<boolean> {
    const work = this.works.get(id)
    if (!work) return false
    
    // Delete associated media files
    await this.deleteMediaFiles(work.image, work.content)
    
    const result = this.works.delete(id)
    if (result) this.saveToFile()
    return result
  }

  // Blog Posts
  getBlogPosts(): BlogPost[] {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getBlogPost(id: string): BlogPost | undefined {
    return this.blogPosts.get(id)
  }

  createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'reactions'>): BlogPost {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      views: 0,
      reactions: { heart: 0, dove: 0, brokenHeart: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.blogPosts.set(newPost.id, newPost)
    this.saveToFile()
    return newPost
  }

  updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | undefined {
    const post = this.blogPosts.get(id)
    if (!post) return undefined
    
    const updated = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.blogPosts.set(id, updated)
    this.saveToFile()
    return updated
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const post = this.blogPosts.get(id)
    if (!post) return false
    
    // Delete associated media files
    await this.deleteMediaFiles(post.image, post.content)
    
    const result = this.blogPosts.delete(id)
    if (result) this.saveToFile()
    return result
  }

  // Quotes
  getQuotes(): Quote[] {
    return Array.from(this.quotes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getQuote(id: string): Quote | undefined {
    return this.quotes.get(id)
  }

  createQuote(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Quote {
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.quotes.set(newQuote.id, newQuote)
    this.saveToFile()
    return newQuote
  }

  updateQuote(id: string, updates: Partial<Quote>): Quote | undefined {
    const quote = this.quotes.get(id)
    if (!quote) return undefined
    
    const updated = {
      ...quote,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.quotes.set(id, updated)
    this.saveToFile()
    return updated
  }

  deleteQuote(id: string): boolean {
    const result = this.quotes.delete(id)
    if (result) this.saveToFile()
    return result
  }

  // Reactions
  addReaction(postId: string, type: 'heart' | 'dove' | 'brokenHeart', userIdentifier: string): boolean {
    // Check if user already reacted to this post
    const existing = this.reactions.find(
      r => r.postId === postId && r.userIdentifier === userIdentifier
    )
    
    if (existing) return false // User already reacted
    
    this.reactions.push({
      postId,
      type,
      userIdentifier,
      createdAt: new Date().toISOString(),
    })
    
    // Update post reaction count
    const post = this.blogPosts.get(postId)
    if (post) {
      post.reactions[type]++
      this.blogPosts.set(postId, post)
    }
    
    this.saveToFile()
    return true
  }

  hasUserReacted(postId: string, userIdentifier: string): boolean {
    return this.reactions.some(
      r => r.postId === postId && r.userIdentifier === userIdentifier
    )
  }

  // Analytics
  trackPageView(page: string, itemId?: string) {
    const today = new Date().toISOString().split('T')[0]
    let analytics = this.analytics.find(a => a.date === today)
    
    if (!analytics) {
      analytics = {
        date: today,
        pageViews: 0,
        uniqueVisitors: 0,
        essayViews: {},
        workViews: {},
        blogViews: {},
        quoteViews: 0,
      }
      this.analytics.push(analytics)
    }
    
    analytics.pageViews++
    
    if (page === 'essay' && itemId) {
      analytics.essayViews[itemId] = (analytics.essayViews[itemId] || 0) + 1
      const essay = this.essays.get(itemId)
      if (essay) {
        essay.views++
        this.essays.set(itemId, essay)
      }
    } else if (page === 'work' && itemId) {
      analytics.workViews[itemId] = (analytics.workViews[itemId] || 0) + 1
      const work = this.works.get(itemId)
      if (work) {
        work.views++
        this.works.set(itemId, work)
      }
    } else if (page === 'blog' && itemId) {
      analytics.blogViews[itemId] = (analytics.blogViews[itemId] || 0) + 1
      const post = this.blogPosts.get(itemId)
      if (post) {
        post.views++
        this.blogPosts.set(itemId, post)
      }
    } else if (page === 'quotes') {
      analytics.quoteViews++
    }
  }

  getAnalytics(startDate?: string, endDate?: string): Analytics[] {
    let filtered = this.analytics
    
    if (startDate) {
      filtered = filtered.filter(a => a.date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter(a => a.date <= endDate)
    }
    
    return filtered.sort((a, b) => b.date.localeCompare(a.date))
  }

  // Helper method to delete media files
  private async deleteMediaFiles(imageUrl?: string, content?: string): Promise<void> {
    const filesToDelete: string[] = []
    
    // Extract file path from image URL
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      filesToDelete.push(imageUrl.replace('/uploads/', ''))
    }
    
    // Extract file paths from content (markdown images and videos)
    if (content) {
      // Match markdown images: ![alt](/uploads/filename)
      const markdownImageRegex = /!\[.*?\]\(\/uploads\/([^)]+)\)/g
      let match
      while ((match = markdownImageRegex.exec(content)) !== null) {
        filesToDelete.push(match[1])
      }
      
      // Match HTML img tags: <img src="/uploads/filename">
      const htmlImageRegex = /<img[^>]+src="\/uploads\/([^"]+)"/g
      while ((match = htmlImageRegex.exec(content)) !== null) {
        filesToDelete.push(match[1])
      }
      
      // Match HTML video tags: <video src="/uploads/filename">
      const htmlVideoRegex = /<video[^>]+src="\/uploads\/([^"]+)"/g
      while ((match = htmlVideoRegex.exec(content)) !== null) {
        filesToDelete.push(match[1])
      }
      
      // Match video source tags: <source src="/uploads/filename">
      const sourceRegex = /<source[^>]+src="\/uploads\/([^"]+)"/g
      while ((match = sourceRegex.exec(content)) !== null) {
        filesToDelete.push(match[1])
      }
    }
    
    // Delete each file
    for (const filename of filesToDelete) {
      try {
        const filePath = join(process.cwd(), 'public', 'uploads', filename)
        if (existsSync(filePath)) {
          await unlink(filePath)
          console.log(`🗑️  Deleted media file: ${filename}`)
        }
      } catch (error) {
        console.error(`❌ Error deleting file ${filename}:`, error)
      }
    }
  }
}

export const db = new Database()
