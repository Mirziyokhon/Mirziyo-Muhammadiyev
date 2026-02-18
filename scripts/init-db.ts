// Script to initialize the Postgres database with default data
import { dbPostgres } from '../lib/db-postgres'

async function initializeDatabase() {
  console.log('🚀 Initializing database...')
  
  try {
    // Initialize tables
    await dbPostgres.initialize()
    console.log('✅ Tables created')
    
    // Check if data already exists
    const existingEssays = await dbPostgres.getEssays()
    if (existingEssays.length > 0) {
      console.log('📝 Database already has data, skipping initialization')
      return
    }
    
    console.log('📝 Adding default data...')
    
    // Add default essays
    const essays = [
      {
        slug: "on-simplicity",
        title: "On Simplicity and Clarity",
        date: "March 15, 2024",
        readingTime: "5 min read",
        summary: "Exploring how simplicity in thought and expression leads to deeper understanding.",
        content: "Exploring how simplicity in thought and expression leads to deeper understanding and more meaningful communication.",
        tags: ["Philosophy", "Writing", "Minimalism"],
      },
      // Add more default essays as needed
    ]
    
    for (const essay of essays) {
      await dbPostgres.createEssay(essay)
      console.log(`  ✓ Added essay: ${essay.title}`)
    }
    
    // Add default quotes
    const quotes = [
      { text: "The unexamined life is not worth living.", author: "Socrates" },
      { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
      // Add more default quotes as needed
    ]
    
    for (const quote of quotes) {
      await dbPostgres.createQuote(quote)
      console.log(`  ✓ Added quote by: ${quote.author}`)
    }
    
    console.log('✅ Database initialized successfully!')
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

initializeDatabase()
