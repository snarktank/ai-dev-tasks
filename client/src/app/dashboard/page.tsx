'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  title: string
  genre: string
  status: string
  chapters: any[]
  createdAt: string
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    genre: '',
    storyBible: '',
    targetWordCount: 130000,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/v1/projects', {
        headers: { Authorization: 'Bearer ' + token },
      })

      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(newProject),
      })

      if (res.ok) {
        const project = await res.json()
        window.location.href = '/project/' + project.id
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">AI Book Writer</h1>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Projects</h2>
          <button
            onClick={() => setShowNewProject(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            + New Project
          </button>
        </div>

        {showNewProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">Create New Project</h3>
              <form onSubmit={createProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Book Title</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <input
                    type="text"
                    value={newProject.genre}
                    onChange={(e) => setNewProject({ ...newProject, genre: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Fantasy, Sci-Fi, Romance, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Story Bible (Critical for Continuity!)
                  </label>
                  <textarea
                    value={newProject.storyBible}
                    onChange={(e) => setNewProject({ ...newProject, storyBible: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 h-64"
                    placeholder="Describe your story world, characters, plot outline, rules, themes, writing style... The more detail, the better the AI will maintain continuity!"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Word Count</label>
                  <input
                    type="number"
                    value={newProject.targetWordCount}
                    onChange={(e) => setNewProject({ ...newProject, targetWordCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                  >
                    Create Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No projects yet</p>
            <p className="text-gray-400">Create your first project to start writing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={'/project/' + project.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{project.genre}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chapters:</span>
                    <span className="font-semibold">{project.chapters.length}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    {project.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
