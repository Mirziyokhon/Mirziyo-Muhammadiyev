// Database wrapper - automatically selects between Postgres and file-based storage
import { db as fileDb } from './db'
import { dbPostgres } from './db-postgres'

// Use Postgres if POSTGRES_URL is set, otherwise fall back to file-based storage
const usePostgres = !!process.env.POSTGRES_URL

export const db = usePostgres ? dbPostgres : fileDb

if (usePostgres) {
  console.log('🐘 Using PostgreSQL database')
  // Initialize database tables on startup
  dbPostgres.initialize().catch(err => {
    console.error('❌ Failed to initialize PostgreSQL:', err)
  })
} else {
  console.log('📁 Using file-based database (development only)')
  console.log('⚠️  WARNING: Data will not persist in production without a database!')
}
