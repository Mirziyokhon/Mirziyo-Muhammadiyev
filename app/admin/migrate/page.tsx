'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MigratePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleMigrate = async () => {
    if (!confirm('Are you sure you want to migrate data from database.json to PostgreSQL?')) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin')
        return
      }

      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Data Migration</CardTitle>
          <CardDescription>
            Migrate your data from the local database.json file to PostgreSQL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Important</h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
              <li>This will migrate essays, works, blog posts, and quotes</li>
              <li>Existing items with the same ID will be skipped</li>
              <li>This operation is safe to run multiple times</li>
            </ul>
          </div>

          <Button 
            onClick={handleMigrate} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? 'Migrating...' : 'Start Migration'}
          </Button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">❌ Error</h3>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">✅ Migration Complete!</h3>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                <p><strong>Results:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Essays migrated: {result.results?.essays || 0}</li>
                  <li>Works migrated: {result.results?.works || 0}</li>
                  <li>Blog posts migrated: {result.results?.blogPosts || 0}</li>
                  <li>Quotes migrated: {result.results?.quotes || 0}</li>
                </ul>
                {result.results?.errors && result.results.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside ml-4">
                      {result.results.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/dashboard')}
            >
              ← Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
