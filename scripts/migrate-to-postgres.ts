// Migration script to transfer data from database.json to PostgreSQL
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { Pool } from 'pg'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

const POSTGRES_URL = process.env.POSTGRES_URL

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL environment variable is not set!')
  console.log('Please set your PostgreSQL connection string in .env.local')
  process.exit(1)
}

const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 1 // Use single connection for migration
})

async function migrate() {
  try {
    console.log('🚀 Starting migration...\n')

    // Read local database.json
    const dataPath = join(process.cwd(), 'data', 'database.json')
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

    console.log('📊 Found data:')
    console.log(`  - ${data.essays.length} essays`)
    console.log(`  - ${data.works.length} works`)
    console.log(`  - ${data.blogPosts.length} blog posts`)
    console.log(`  - ${data.quotes.length} quotes\n`)

    // Migrate Essays
    console.log('📝 Migrating essays...')
    for (const essay of data.essays) {
      try {
        console.log(`  ⏳ Migrating: ${essay.title.substring(0, 60)}...`)
        await pool.query(`
          INSERT INTO essays (id, title, slug, content, summary, date, reading_time, tags, views, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            date = EXCLUDED.date,
            reading_time = EXCLUDED.reading_time,
            tags = EXCLUDED.tags,
            updated_at = EXCLUDED.updated_at
        `, [
          essay.id,
          essay.title,
          essay.slug,
          essay.content,
          essay.summary || '',
          essay.date,
          essay.readingTime || '',
          essay.tags || [],
          essay.views || 0,
          essay.createdAt,
          essay.updatedAt
        ])
        console.log(`  ✅ ${essay.title}`)
      } catch (error) {
        console.error(`  ❌ Failed to migrate essay: ${essay.title}`)
        console.error(`     Error: ${error}`)
      }
    }

    // Migrate Works
    console.log('\n📚 Migrating works...')
    for (const work of data.works) {
      await pool.query(`
        INSERT INTO works (id, title, slug, content, image, date, views, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          image = EXCLUDED.image,
          date = EXCLUDED.date,
          updated_at = EXCLUDED.updated_at
      `, [
        work.id,
        work.title,
        work.slug,
        work.content,
        work.image || null,
        work.date,
        work.views || 0,
        work.createdAt,
        work.updatedAt
      ])
      console.log(`  ✅ ${work.title}`)
    }

    // Migrate Blog Posts
    console.log('\n📰 Migrating blog posts...')
    for (const post of data.blogPosts) {
      await pool.query(`
        INSERT INTO blog_posts (id, title, slug, content, image, date, linkedin_url, heart_reactions, dove_reactions, broken_heart_reactions, views, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          image = EXCLUDED.image,
          date = EXCLUDED.date,
          linkedin_url = EXCLUDED.linkedin_url,
          heart_reactions = EXCLUDED.heart_reactions,
          dove_reactions = EXCLUDED.dove_reactions,
          broken_heart_reactions = EXCLUDED.broken_heart_reactions,
          updated_at = EXCLUDED.updated_at
      `, [
        post.id,
        post.title,
        post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        post.content,
        post.image || null,
        post.date,
        post.linkedInUrl || null,
        post.reactions?.heart || 0,
        post.reactions?.dove || 0,
        post.reactions?.brokenHeart || 0,
        post.views || 0,
        post.createdAt,
        post.updatedAt
      ])
      console.log(`  ✅ ${post.title}`)
    }

    // Migrate Quotes
    console.log('\n💬 Migrating quotes...')
    for (const quote of data.quotes) {
      await pool.query(`
        INSERT INTO quotes (id, text, author, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          text = EXCLUDED.text,
          author = EXCLUDED.author,
          updated_at = EXCLUDED.updated_at
      `, [
        quote.id,
        quote.text,
        quote.author,
        quote.createdAt,
        quote.updatedAt
      ])
      console.log(`  ✅ "${quote.text.substring(0, 50)}..." - ${quote.author}`)
    }

    // Migrate Reactions
    if (data.reactions && data.reactions.length > 0) {
      console.log('\n❤️  Migrating reactions...')
      for (const reaction of data.reactions) {
        try {
          await pool.query(`
            INSERT INTO reactions (post_id, type, user_identifier, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (post_id, user_identifier) DO NOTHING
          `, [
            reaction.postId,
            reaction.type,
            reaction.userIdentifier,
            reaction.createdAt
          ])
        } catch (err) {
          // Skip if reaction already exists
        }
      }
      console.log(`  ✅ Migrated ${data.reactions.length} reactions`)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n🎉 Your data is now in PostgreSQL and will persist across deployments!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
