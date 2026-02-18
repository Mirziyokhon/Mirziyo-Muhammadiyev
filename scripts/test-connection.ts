// Test PostgreSQL connection
import { config } from 'dotenv'
import { join } from 'path'
import { Pool } from 'pg'

// Load environment variables
config({ path: join(process.cwd(), '.env.local') })

const POSTGRES_URL = process.env.POSTGRES_URL

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL not set!')
  process.exit(1)
}

console.log('🔍 Testing PostgreSQL connection...')
console.log(`📍 Host: ${process.env.POSTGRES_HOST}`)
console.log(`👤 User: ${process.env.POSTGRES_USER}`)
console.log(`🗄️  Database: ${process.env.POSTGRES_DATABASE}\n`)

const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000
})

async function testConnection() {
  try {
    console.log('⏳ Connecting...')
    const client = await pool.connect()
    console.log('✅ Connected successfully!')
    
    console.log('\n📊 Testing query...')
    const result = await client.query('SELECT NOW()')
    console.log(`✅ Query successful! Server time: ${result.rows[0].now}`)
    
    console.log('\n📋 Checking tables...')
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    
    if (tables.rows.length === 0) {
      console.log('⚠️  No tables found. Database needs initialization.')
    } else {
      console.log('✅ Found tables:')
      tables.rows.forEach(row => console.log(`   - ${row.table_name}`))
    }
    
    client.release()
    await pool.end()
    
    console.log('\n🎉 Connection test passed!')
  } catch (error) {
    console.error('\n❌ Connection test failed!')
    console.error('Error:', error)
    process.exit(1)
  }
}

testConnection()
