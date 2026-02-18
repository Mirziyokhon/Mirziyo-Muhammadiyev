"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Upload, Heart, Bird, HeartCrack } from 'lucide-react'
import Image from 'next/image'
import MediaUpload from './MediaUpload'
import { RichTextEditor } from './RichTextEditor'

// Works Tab
export function WorksTab({ token }: { token: string }) {
  const [works, setWorks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    date: '',
  })

  useEffect(() => {
    fetchWorks()
  }, [])

  const fetchWorks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/works', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setWorks(data)
    } catch (error) {
      console.error('Failed to fetch works:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await response.json()
      setFormData(prev => ({ ...prev, image: data.url }))
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Auto-generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const payload = {
      ...formData,
      slug,
    }

    try {
      if (editingId) {
        await fetch('/api/admin/works', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        await fetch('/api/admin/works', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
      }
      
      resetForm()
      fetchWorks()
    } catch (error) {
      console.error('Failed to save work:', error)
    }
  }

  const handleEdit = (work: any) => {
    setEditingId(work.id)
    setFormData({
      title: work.title,
      content: work.content,
      image: work.image || '',
      date: work.date,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      await fetch('/api/admin/works', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      fetchWorks()
    } catch (error) {
      console.error('Failed to delete work:', error)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', image: '', date: '' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Works ({works.length})</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Work
        </button>
      </div>

      {showForm && (
        <FormModal title={editingId ? 'Edit Work' : 'Add Work'} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your work content here..."
                token={token}
              />
            </div>
            <input
              type="text"
              placeholder="Date (e.g., March 2024)"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
              required
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <MediaUpload
                onUploadComplete={(url) => setFormData({ ...formData, image: url })}
                currentMedia={formData.image}
                acceptVideo={false}
                section="works"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-[#8B6F47] text-white rounded hover:opacity-90">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded">
                Cancel
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="grid gap-4">
        {works.map((work) => (
          <div key={work.id} className="border border-border rounded-lg p-4 flex justify-between items-start">
            <div className="flex gap-4 flex-1">
              {work.image && (
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image src={work.image} alt={work.title} fill className="object-cover rounded" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{work.title}</h3>
                <p className="text-sm text-muted-foreground">{work.date} • {work.views} views</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(work)} className="p-2 hover:bg-muted/30 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(work.id)} className="p-2 hover:bg-red-50 text-red-600 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Blog Tab
export function BlogTab({ token }: { token: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    date: '',
    linkedInUrl: '',
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/blog', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await response.json()
      setFormData(prev => ({ ...prev, image: data.url }))
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        await fetch('/api/admin/blog', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingId, ...formData }),
        })
      } else {
        await fetch('/api/admin/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })
      }
      
      resetForm()
      fetchPosts()
    } catch (error) {
      console.error('Failed to save post:', error)
    }
  }

  const handleEdit = (post: any) => {
    setEditingId(post.id)
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image || '',
      date: post.date,
      linkedInUrl: post.linkedInUrl || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      fetchPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', image: '', date: '', linkedInUrl: '' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Blog Posts ({posts.length})</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      {showForm && (
        <FormModal title={editingId ? 'Edit Post' : 'Add Post'} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog post content here..."
                token={token}
              />
            </div>
            <input
              type="text"
              placeholder="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
              required
            />
            <input
              type="url"
              placeholder="LinkedIn URL (optional)"
              value={formData.linkedInUrl}
              onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Image/Video</label>
              <MediaUpload
                onUploadComplete={(url) => setFormData({ ...formData, image: url })}
                currentMedia={formData.image}
                acceptVideo={true}
                section="blog"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-[#8B6F47] text-white rounded hover:opacity-90">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded">
                Cancel
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-4 flex-1">
                {post.image && (
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image src={post.image} alt={post.title} fill className="object-cover rounded" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">{post.date} • {post.views} views</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(post)} className="p-2 hover:bg-muted/30 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-red-50 text-red-600 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                {post.reactions.heart}
              </div>
              <div className="flex items-center gap-1">
                <Bird className="w-4 h-4 text-blue-500" />
                {post.reactions.dove}
              </div>
              <div className="flex items-center gap-1">
                <HeartCrack className="w-4 h-4 text-purple-500" />
                {post.reactions.brokenHeart}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quotes Tab
export function QuotesTab({ token }: { token: string }) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    text: '',
    author: '',
  })

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/quotes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setQuotes(data)
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        await fetch('/api/admin/quotes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingId, ...formData }),
        })
      } else {
        await fetch('/api/admin/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })
      }
      
      resetForm()
      fetchQuotes()
    } catch (error) {
      console.error('Failed to save quote:', error)
    }
  }

  const handleEdit = (quote: any) => {
    setEditingId(quote.id)
    setFormData({
      text: quote.text,
      author: quote.author,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      await fetch('/api/admin/quotes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      fetchQuotes()
    } catch (error) {
      console.error('Failed to delete quote:', error)
    }
  }

  const resetForm = () => {
    setFormData({ text: '', author: '' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Quotes ({quotes.length})</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Quote
        </button>
      </div>

      {showForm && (
        <FormModal title={editingId ? 'Edit Quote' : 'Add Quote'} onClose={resetForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Quote text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded h-32"
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded"
              required
            />

            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-[#8B6F47] text-white rounded hover:opacity-90">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded">
                Cancel
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <div key={quote.id} className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-lg mb-2">&quot;{quote.text}&quot;</p>
                <p className="text-sm text-muted-foreground">— {quote.author}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(quote)} className="p-2 hover:bg-muted/30 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(quote.id)} className="p-2 hover:bg-red-50 text-red-600 rounded">
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

// Helper component for modal
function FormModal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-border flex-shrink-0">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
}
