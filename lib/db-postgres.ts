// PostgreSQL database implementation for production
import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Helper to execute queries
async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

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
  userIdentifier: string
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  company: string
  date: string
  image?: string
  technologies: string[]
  link?: string
  views: number
  createdAt: string
  updatedAt: string
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

class PostgresDatabase {
  // Initialize database tables
  async initialize() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS essays (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT NOT NULL,
          summary TEXT NOT NULL,
          date TEXT NOT NULL,
          reading_time TEXT NOT NULL,
          tags TEXT[] NOT NULL,
          views INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await query(`
        CREATE TABLE IF NOT EXISTS works (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT NOT NULL,
          image TEXT,
          date TEXT NOT NULL,
          views INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT NOT NULL,
          image TEXT,
          date TEXT NOT NULL,
          linkedin_url TEXT,
          heart_reactions INTEGER DEFAULT 0,
          dove_reactions INTEGER DEFAULT 0,
          broken_heart_reactions INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await query(`
        CREATE TABLE IF NOT EXISTS quotes (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          author TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await query(`
        CREATE TABLE IF NOT EXISTS reactions (
          id SERIAL PRIMARY KEY,
          post_id TEXT NOT NULL,
          type TEXT NOT NULL,
          user_identifier TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(post_id, user_identifier)
        )
      `)

      console.log('✅ Database tables initialized')
    } catch (error) {
      console.error('❌ Error initializing database:', error)
    }
  }

  // Essays
  async getEssays(): Promise<Essay[]> {
    const result = await query(`
      SELECT 
        id, title, slug, content, summary, date, 
        reading_time as "readingTime", tags, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM essays 
      ORDER BY created_at DESC
    `)
    return result.rows as Essay[]
  }

  async getEssay(id: string): Promise<Essay | undefined> {
    const result = await query(`
      SELECT 
        id, title, slug, content, summary, date, 
        reading_time as "readingTime", tags, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM essays 
      WHERE id = $1
    `, [id])
    return result.rows[0] as Essay | undefined
  }

  async createEssay(essay: Omit<Essay, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Essay> {
    const id = Date.now().toString()
    const result = await query(`
      INSERT INTO essays (id, title, slug, content, summary, date, reading_time, tags, views)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id, title, slug, content, summary, date, 
        reading_time as "readingTime", tags, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
    `, [id, essay.title, essay.slug, essay.content, essay.summary, essay.date, essay.readingTime, essay.tags, 0])
    return result.rows[0] as Essay
  }

  async updateEssay(id: string, updates: Partial<Essay>): Promise<Essay | undefined> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`)
      values.push(updates.slug)
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`)
      values.push(updates.content)
    }
    if (updates.summary !== undefined) {
      fields.push(`summary = $${paramIndex++}`)
      values.push(updates.summary)
    }
    if (updates.date !== undefined) {
      fields.push(`date = $${paramIndex++}`)
      values.push(updates.date)
    }
    if (updates.readingTime !== undefined) {
      fields.push(`reading_time = $${paramIndex++}`)
      values.push(updates.readingTime)
    }
    if (updates.tags !== undefined) {
      fields.push(`tags = $${paramIndex++}`)
      values.push(updates.tags)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await query(
      `UPDATE essays SET ${fields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING 
         id, title, slug, content, summary, date, 
         reading_time as "readingTime", tags, views,
         created_at::text as "createdAt", updated_at::text as "updatedAt"`,
      values
    )

    return result.rows[0] as Essay | undefined
  }

  async deleteEssay(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM essays WHERE id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  // Works
  async getWorks(): Promise<Work[]> {
    const result = await query(`
      SELECT 
        id, title, slug, content, image, date, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM works 
      ORDER BY created_at DESC
    `)
    return result.rows as Work[]
  }

  async getWork(id: string): Promise<Work | undefined> {
    const result = await query(`
      SELECT 
        id, title, slug, content, image, date, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM works 
      WHERE id = $1
    `, [id])
    return result.rows[0] as Work | undefined
  }

  async createWork(work: Omit<Work, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Work> {
    const id = Date.now().toString()
    const result = await query(`
      INSERT INTO works (id, title, slug, content, image, date, views)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, title, slug, content, image, date, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
    `, [id, work.title, work.slug, work.content, work.image || null, work.date, 0])
    return result.rows[0] as Work
  }

  async updateWork(id: string, updates: Partial<Work>): Promise<Work | undefined> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`)
      values.push(updates.slug)
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`)
      values.push(updates.content)
    }
    if (updates.image !== undefined) {
      fields.push(`image = $${paramIndex++}`)
      values.push(updates.image)
    }
    if (updates.date !== undefined) {
      fields.push(`date = $${paramIndex++}`)
      values.push(updates.date)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await query(
      `UPDATE works SET ${fields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING 
         id, title, slug, content, image, date, views,
         created_at::text as "createdAt", updated_at::text as "updatedAt"`,
      values
    )

    return result.rows[0] as Work | undefined
  }

  async deleteWork(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM works WHERE id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    const result = await query(`
      SELECT 
        id, title, slug, content, image, date, linkedin_url as "linkedInUrl",
        heart_reactions as heart, dove_reactions as dove, broken_heart_reactions as "brokenHeart",
        views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM blog_posts 
      ORDER BY created_at DESC
    `)
    
    return result.rows.map(row => ({
      ...row,
      reactions: {
        heart: row.heart || 0,
        dove: row.dove || 0,
        brokenHeart: row.brokenHeart || 0
      }
    })) as BlogPost[]
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const result = await query(`
      SELECT 
        id, title, slug, content, image, date, linkedin_url as "linkedInUrl",
        heart_reactions as heart, dove_reactions as dove, broken_heart_reactions as "brokenHeart",
        views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM blog_posts 
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) return undefined
    
    const row = result.rows[0]
    return {
      ...row,
      reactions: {
        heart: row.heart || 0,
        dove: row.dove || 0,
        brokenHeart: row.brokenHeart || 0
      }
    } as BlogPost
  }

  async createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'reactions'>): Promise<BlogPost> {
    const id = Date.now().toString()
    const result = await query(`
      INSERT INTO blog_posts (id, title, slug, content, image, date, linkedin_url, heart_reactions, dove_reactions, broken_heart_reactions, views)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, title, slug, content, image, date, linkedin_url as "linkedInUrl",
        heart_reactions as heart, dove_reactions as dove, broken_heart_reactions as "brokenHeart",
        views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
    `, [id, post.title, post.slug, post.content, post.image || null, post.date, post.linkedInUrl || null, 0, 0, 0, 0])
    
    const row = result.rows[0]
    return {
      ...row,
      reactions: {
        heart: row.heart || 0,
        dove: row.dove || 0,
        brokenHeart: row.brokenHeart || 0
      }
    } as BlogPost
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.slug !== undefined) {
      fields.push(`slug = $${paramIndex++}`)
      values.push(updates.slug)
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`)
      values.push(updates.content)
    }
    if (updates.image !== undefined) {
      fields.push(`image = $${paramIndex++}`)
      values.push(updates.image)
    }
    if (updates.date !== undefined) {
      fields.push(`date = $${paramIndex++}`)
      values.push(updates.date)
    }
    if (updates.linkedInUrl !== undefined) {
      fields.push(`linkedin_url = $${paramIndex++}`)
      values.push(updates.linkedInUrl)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await query(
      `UPDATE blog_posts SET ${fields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING 
         id, title, slug, content, image, date, linkedin_url as "linkedInUrl",
         heart_reactions as heart, dove_reactions as dove, broken_heart_reactions as "brokenHeart",
         views,
         created_at::text as "createdAt", updated_at::text as "updatedAt"`,
      values
    )

    if (result.rows.length === 0) return undefined
    
    const row = result.rows[0]
    return {
      ...row,
      reactions: {
        heart: row.heart || 0,
        dove: row.dove || 0,
        brokenHeart: row.brokenHeart || 0
      }
    } as BlogPost
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM blog_posts WHERE id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    const result = await query(`
      SELECT 
        id, text, author,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM quotes 
      ORDER BY created_at DESC
    `)
    return result.rows as Quote[]
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const result = await query(`
      SELECT 
        id, text, author,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM quotes 
      WHERE id = $1
    `, [id])
    return result.rows[0] as Quote | undefined
  }

  async createQuote(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
    const id = Date.now().toString()
    const result = await query(`
      INSERT INTO quotes (id, text, author)
      VALUES ($1, $2, $3)
      RETURNING 
        id, text, author,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
    `, [id, quote.text, quote.author])
    return result.rows[0] as Quote
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | undefined> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.text !== undefined) {
      fields.push(`text = $${paramIndex++}`)
      values.push(updates.text)
    }
    if (updates.author !== undefined) {
      fields.push(`author = $${paramIndex++}`)
      values.push(updates.author)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await query(
      `UPDATE quotes SET ${fields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING 
         id, text, author,
         created_at::text as "createdAt", updated_at::text as "updatedAt"`,
      values
    )

    return result.rows[0] as Quote | undefined
  }

  async deleteQuote(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM quotes WHERE id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  // Reactions
  async addReaction(postId: string, type: 'heart' | 'dove' | 'brokenHeart', userIdentifier: string): Promise<boolean> {
    try {
      // Try to insert reaction
      await query(`
        INSERT INTO reactions (post_id, type, user_identifier)
        VALUES ($1, $2, $3)
      `, [postId, type, userIdentifier])

      // Update post reaction count
      const field = type === 'brokenHeart' ? 'broken_heart_reactions' : `${type}_reactions`
      await query(
        `UPDATE blog_posts SET ${field} = ${field} + 1 WHERE id = $1`,
        [postId]
      )

      return true
    } catch (error) {
      // User already reacted (unique constraint violation)
      return false
    }
  }

  async hasUserReacted(postId: string, userIdentifier: string): Promise<boolean> {
    const result = await query(`
      SELECT 1 FROM reactions 
      WHERE post_id = $1 AND user_identifier = $2
    `, [postId, userIdentifier])
    return result.rows.length > 0
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const result = await query(`
      SELECT 
        id, title, description, company, date, image, technologies, link, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM projects 
      ORDER BY created_at DESC
    `)
    return result.rows as Project[]
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await query(`
      SELECT 
        id, title, description, company, date, image, technologies, link, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
      FROM projects 
      WHERE id = $1
    `, [id])
    return result.rows[0] as Project | undefined
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<Project> {
    const id = Date.now().toString()
    const result = await query(`
      INSERT INTO projects (id, title, description, company, date, image, technologies, link, views)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
      RETURNING 
        id, title, description, company, date, image, technologies, link, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"
    `, [id, project.title, project.description, project.company, project.date, project.image || null, project.technologies, project.link || null])
    return result.rows[0] as Project
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.company !== undefined) {
      fields.push(`company = $${paramIndex++}`)
      values.push(updates.company)
    }
    if (updates.date !== undefined) {
      fields.push(`date = $${paramIndex++}`)
      values.push(updates.date)
    }
    if (updates.image !== undefined) {
      fields.push(`image = $${paramIndex++}`)
      values.push(updates.image)
    }
    if (updates.technologies !== undefined) {
      fields.push(`technologies = $${paramIndex++}`)
      values.push(updates.technologies)
    }
    if (updates.link !== undefined) {
      fields.push(`link = $${paramIndex++}`)
      values.push(updates.link)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING 
        id, title, description, company, date, image, technologies, link, views,
        created_at::text as "createdAt", updated_at::text as "updatedAt"`,
      values
    )

    return result.rows[0] as Project | undefined
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM projects WHERE id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  // Analytics (simplified - you can expand this)
  async trackPageView(page: string, itemId?: string): Promise<void> {
    if (page === 'essay' && itemId) {
      await query(`UPDATE essays SET views = views + 1 WHERE id = $1`, [itemId])
    } else if (page === 'work' && itemId) {
      await query(`UPDATE works SET views = views + 1 WHERE id = $1`, [itemId])
    } else if (page === 'blog' && itemId) {
      await query(`UPDATE blog_posts SET views = views + 1 WHERE id = $1`, [itemId])
    } else if (page === 'project' && itemId) {
      await query(`UPDATE projects SET views = views + 1 WHERE id = $1`, [itemId])
    }
  }
}

export const dbPostgres = new PostgresDatabase()


