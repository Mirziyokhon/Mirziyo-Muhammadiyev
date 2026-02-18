// Initialize Supabase database tables
const { Client } = require('pg');

async function initDatabase() {
  console.log('🚀 Initializing database tables...');
  
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL environment variable not set');
    process.exit(1);
  }
  
  const client = new Client({ connectionString });
  await client.connect();
  
  try {
    // Create essays table
    await client.query(`
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
    `;
    console.log('✅ Essays table created');

    // Create works table
    await client.query(`
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
    `;
    console.log('✅ Works table created');

    // Create blog_posts table
    await client.query(`
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
    `;
    console.log('✅ Blog posts table created');

    // Create quotes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Quotes table created');

    // Create reactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id SERIAL PRIMARY KEY,
        post_id TEXT NOT NULL,
        type TEXT NOT NULL,
        user_identifier TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_identifier)
      )
    `;
    console.log('✅ Reactions table created');

    console.log('🎉 Database initialized successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

initDatabase();
