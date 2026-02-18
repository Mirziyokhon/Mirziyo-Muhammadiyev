"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, FileText, Briefcase, MessageSquare, Quote, 
  LogOut, Eye, Heart
} from 'lucide-react'
import { EssaysTab } from '@/components/admin/EssaysTab'
import { WorksTab, BlogTab, QuotesTab } from '@/components/admin/AdminTabs'

type Tab = 'analytics' | 'essays' | 'works' | 'blog' | 'quotes'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics')
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      router.push('/admin')
    } else {
      setToken(adminToken)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Analytics
          </TabButton>
          <TabButton
            active={activeTab === 'essays'}
            onClick={() => setActiveTab('essays')}
            icon={<FileText className="w-4 h-4" />}
          >
            Essays
          </TabButton>
          <TabButton
            active={activeTab === 'works'}
            onClick={() => setActiveTab('works')}
            icon={<Briefcase className="w-4 h-4" />}
          >
            Works
          </TabButton>
          <TabButton
            active={activeTab === 'blog'}
            onClick={() => setActiveTab('blog')}
            icon={<MessageSquare className="w-4 h-4" />}
          >
            Blog
          </TabButton>
          <TabButton
            active={activeTab === 'quotes'}
            onClick={() => setActiveTab('quotes')}
            icon={<Quote className="w-4 h-4" />}
          >
            Quotes
          </TabButton>
        </div>

        {/* Content */}
        <div className="bg-background">
          {activeTab === 'analytics' && <AnalyticsTab token={token} />}
          {activeTab === 'essays' && <EssaysTab token={token} />}
          {activeTab === 'works' && <WorksTab token={token} />}
          {activeTab === 'blog' && <BlogTab token={token} />}
          {activeTab === 'quotes' && <QuotesTab token={token} />}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#8B6F47] text-white'
          : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

// Analytics Tab Component
function AnalyticsTab({ token }: { token: string }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-12">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded ${period === 'daily' ? 'bg-[#8B6F47] text-white' : 'bg-muted/30'}`}
        >
          Daily
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`px-4 py-2 rounded ${period === 'weekly' ? 'bg-[#8B6F47] text-white' : 'bg-muted/30'}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded ${period === 'monthly' ? 'bg-[#8B6F47] text-white' : 'bg-muted/30'}`}
        >
          Monthly
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={analytics.summary.totalViews}
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="Total Reactions"
          value={analytics.summary.totalReactions}
          icon={<Heart className="w-5 h-5" />}
        />
        <StatCard
          title="Essays"
          value={analytics.summary.totalEssays}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Blog Posts"
          value={analytics.summary.totalBlogPosts}
          icon={<MessageSquare className="w-5 h-5" />}
        />
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Essays</h3>
          <div className="space-y-3">
            {analytics.summary.topEssays.map((essay: any) => (
              <div key={essay.id} className="flex justify-between items-center">
                <span className="text-sm truncate flex-1">{essay.title}</span>
                <span className="text-sm text-muted-foreground ml-2">{essay.views} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Blog Posts</h3>
          <div className="space-y-3">
            {analytics.summary.topBlogPosts.map((post: any) => (
              <div key={post.id} className="flex justify-between items-center">
                <span className="text-sm truncate flex-1">{post.title}</span>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm text-muted-foreground">{post.views} views</span>
                  <div className="flex items-center gap-1 text-xs">
                    <Heart className="w-3 h-3" /> {post.reactions.heart}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="text-[#8B6F47]">{icon}</div>
      </div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  )
}

// Continue with other tab components...
// Due to length, I'll create separate files for each tab component
