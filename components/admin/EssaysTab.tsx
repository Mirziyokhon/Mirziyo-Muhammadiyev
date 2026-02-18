"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'

export function EssaysTab({ token }: { token: string }) {
  const [essays, setEssays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    summary: '',
    date: '',
    readingTime: '',
    tags: '',
  })

  useEffect(() => {
    fetchEssays()
  }, [])

  const fetchEssays = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/essays', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setEssays(data)
    } catch (error) {
      console.error('Failed to fetch essays:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Auto-generate slug from title if not editing
    const slug = editingId ? formData.slug : formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    const payload = {
      ...formData,
      slug,
      tags: formData.tags.split(',').map(t => t.trim()),
    }

    try {
      if (editingId) {
        await fetch('/api/admin/essays', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        await fetch('/api/admin/essays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
      }
      
      resetForm()
      fetchEssays()
    } catch (error) {
      console.error('Failed to save essay:', error)
    }
  }

  const handleEdit = (essay: any) => {
    setEditingId(essay.id)
    setFormData({
      title: essay.title,
      slug: essay.slug,
      content: essay.content,
      summary: essay.summary,
      date: essay.date,
      readingTime: essay.readingTime,
      tags: essay.tags.join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this essay?')) return

    try {
      await fetch('/api/admin/essays', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      fetchEssays()
    } catch (error) {
      console.error('Failed to delete essay:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      summary: '',
      date: '',
      readingTime: '',
      tags: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="text-center py-12">Loading essays...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Essays ({essays.length})</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Essay
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-border flex-shrink-0">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Essay' : 'Add New Essay'}
              </h3>
              <button onClick={resetForm}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your essay content here..."
                  token={token}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="March 15, 2024"
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Philosophy, Writing, Minimalism"
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#8B6F47] text-white rounded hover:opacity-90"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-border rounded hover:bg-muted/30"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {essays.map((essay) => (
          <div key={essay.id} className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{essay.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{essay.summary}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{essay.date}</span>
                  <span>{essay.readingTime}</span>
                  <span>{essay.views} views</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(essay)}
                  className="p-2 hover:bg-muted/30 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(essay.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
