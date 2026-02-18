const { Client } = require('pg');

async function init() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create tables
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
    `);
    console.log('✅ Essays table created');

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
    `);
    console.log('✅ Works table created');

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
    `);
    console.log('✅ Blog posts table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Quotes table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id SERIAL PRIMARY KEY,
        post_id TEXT NOT NULL,
        type TEXT NOT NULL,
        user_identifier TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_identifier)
      )
    `);
    console.log('✅ Reactions table created');

    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

init();
