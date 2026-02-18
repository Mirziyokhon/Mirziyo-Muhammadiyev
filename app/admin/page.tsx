"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        router.push('/admin/dashboard')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B6F47]/10 rounded-full mb-4">
            <Lock className="w-8 h-8 text-[#8B6F47]" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#8B6F47] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
