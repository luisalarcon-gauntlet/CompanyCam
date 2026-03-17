import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, LogOut, HardHat, ChevronDown } from 'lucide-react'
import { projectsApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../services/api'
import { useOfflineStore } from '../stores/offlineStore'
import { ProjectCard } from '../components/project/ProjectCard'
import { Button } from '../components/ui/Button'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const { cacheProjectsList } = useOfflineStore()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => projectsApi.list(search ? { search } : undefined),
    select: (res) => res.data.data,
  })

  useEffect(() => {
    if (data && data.length > 0) {
      cacheProjectsList(data)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  const projects = data || []

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-[720px] mx-auto xl:max-w-none xl:mx-0">
      {/* Header */}
      <div className="bg-navy px-4 pt-safe-top pb-4 safe-top">
        {/* Mobile / tablet: brand logo + logout */}
        <div className="xl:hidden flex items-center justify-between pt-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Field<span className="text-warning">Check</span>
            </h1>
            <p className="text-slate-400 text-sm truncate">
              Hey {user?.name?.split(' ')[0] || 'there'} 👋
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex-shrink-0"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Desktop: page title row */}
        <div className="hidden xl:flex items-center justify-between py-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Projects</h2>
        </div>

        {/* Search — always shown */}
        <div className="mt-4 xl:mt-0 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 text-white placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-warning/50"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-24 xl:pb-8 xl:px-6">
        {isLoading ? (
          <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            Failed to load projects. Please try again.
          </div>
        ) : projects.length === 0 ? (
          <EmptyState search={search} onCreateClick={() => navigate('/projects/new')} />
        ) : (
          <div className="flex flex-col gap-2">
            {/* Count + sort header */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted font-medium">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </p>
              <button className="hidden xl:flex items-center gap-1 text-sm text-muted hover:text-navy font-medium transition-colors">
                Sort <ChevronDown size={14} />
              </button>
            </div>

            {/* Cards: single column on mobile/tablet, 2-col grid on desktop */}
            <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB — mobile / tablet only (desktop uses sidebar's New Project button) */}
      <div
        className="xl:hidden fixed bottom-6 right-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/projects/new')}
          className="shadow-lg shadow-primary/30"
        >
          <Plus size={20} />
          New Project
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ search, onCreateClick }) {
  if (search) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">No projects matching &ldquo;{search}&rdquo;</p>
      </div>
    )
  }
  return (
    <div className="text-center py-16 flex flex-col items-center gap-4">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <HardHat size={40} className="text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-navy">No projects yet</h3>
        <p className="text-muted mt-1">Create your first project to get started</p>
      </div>
      <Button onClick={onCreateClick} size="lg">
        <Plus size={20} />
        Create first project
      </Button>
    </div>
  )
}
