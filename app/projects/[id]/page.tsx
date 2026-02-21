"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, MapPin, Eye } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string)
    }
  }, [params.id])

  const fetchProject = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/public/projects`)
      const projects = await response.json()
      const foundProject = projects.find((p: any) => p.id === id)
      
      if (foundProject) {
        setProject(foundProject)
        // Increment view count
        await fetch(`/api/public/projects/${id}/view`, { method: 'POST' })
      } else {
        setError('Project not found')
      }
    } catch (error) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (error || !project) return <div className="text-center py-12">{error || 'Project not found'}</div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Back Navigation */}
      <Link 
        href="/projects" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <header className="mb-12">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-heading text-4xl font-semibold mb-4">{project.title}</h1>
            {project.company && (
              <p className="text-xl text-[#8B6F47] font-medium mb-4">{project.company}</p>
            )}
          </div>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#8B6F47] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              View Project
            </a>
          )}
        </div>

        <div className="flex items-center gap-6 text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{project.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{project.views} views</span>
          </div>
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {project.technologies.map((tech: string, index: number) => (
              <span key={index} className="px-4 py-2 bg-[#8B6F47]/20 text-[#8B6F47] rounded-full text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Project Image */}
      {project.image && (
        <div className="relative h-96 w-full mb-12 rounded-lg overflow-hidden">
          <Image src={project.image} alt={project.title} fill className="object-cover" />
        </div>
      )}

      {/* Project Description */}
      <div className="prose prose-lg max-w-none">
        <h2 className="font-heading text-2xl font-semibold mb-4">About This Project</h2>
        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {project.description}
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-12 pt-12 border-t border-border">
        <h2 className="font-heading text-2xl font-semibold mb-6">Project Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Timeline</h3>
            <p className="text-muted-foreground">{project.date}</p>
          </div>
          {project.company && (
            <div>
              <h3 className="font-medium mb-2">Organization</h3>
              <p className="text-muted-foreground">{project.company}</p>
            </div>
          )}
          <div>
            <h3 className="font-medium mb-2">Technologies Used</h3>
            <p className="text-muted-foreground">{project.technologies.join(', ')}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Project Views</h3>
            <p className="text-muted-foreground">{project.views} views</p>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      <div className="mt-16">
        <h2 className="font-heading text-2xl font-semibold mb-6">More Projects</h2>
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-[#8B6F47] hover:opacity-70 transition-opacity"
        >
          View All Projects →
        </Link>
      </div>
    </div>
  )
}
