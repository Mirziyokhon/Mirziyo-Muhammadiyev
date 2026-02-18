import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const DATA_FILE = join(DATA_DIR, 'database.json')

export interface StorageData {
  essays: any[]
  works: any[]
  blogPosts: any[]
  quotes: any[]
  reactions: any[]
  analytics: any[]
}

// Check if we're in a serverless/read-only environment (like Netlify)
let isReadOnly = false

export function ensureDataDir() {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (error) {
    // File system is read-only (serverless environment)
    isReadOnly = true
    console.log('📦 Running in read-only environment (serverless)')
  }
}

export function loadData(): StorageData | null {
  try {
    ensureDataDir()
    
    if (isReadOnly || !existsSync(DATA_FILE)) {
      return null
    }
    
    const fileContent = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading data:', error)
    return null
  }
}

export function saveData(data: StorageData): boolean {
  if (isReadOnly) {
    // In serverless environment, we can't save to file system
    // Data will be lost on function restart, but that's expected
    console.log('⚠️  Cannot save data in read-only environment')
    return false
  }
  
  try {
    ensureDataDir()
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error saving data:', error)
    isReadOnly = true // Mark as read-only for future attempts
    return false
  }
}
