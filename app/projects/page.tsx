"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Calendar, MapPin } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/public/projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <header className="mb-16">
        <h1 className="font-heading text-4xl font-semibold mb-4">Projects</h1>
        <p className="text-lg text-muted-foreground mb-8">
          A collection of my professional work, academic projects, and open-source contributions.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link 
            key={project.id} 
            href={`/projects/${project.id}`}
            className="block border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {project.image && (
              <div className="relative h-48 w-full">
                <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-xl font-semibold mb-2 group-hover:text-[#8B6F47] transition-colors">{project.title}</h3>
                  {project.company && (
                    <p className="text-sm text-[#8B6F47] font-medium mb-2">{project.company}</p>
                  )}
                  <p className="text-muted-foreground mb-4 line-clamp-3 overflow-hidden">{project.description}</p>
                </div>
                {project.link && (
                  <div className="mt-auto">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B6F47] hover:opacity-70 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-[#8B6F47]/20 text-[#8B6F47] text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{project.date}</span>
                {project.views > 0 && (
                  <span className="ml-auto">{project.views} views</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      )}
    </div>
  )
}
