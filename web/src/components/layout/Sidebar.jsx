import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { Plus, LogOut, List } from 'lucide-react'
import { projectsApi, authApi } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { ProgressRing } from '../ui/ProgressRing'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user, clearAuth } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
    select: (res) => res.data.data,
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      queryClient.clear()
      clearAuth()
      navigate('/login')
    },
  })

  const projects = data || []

  // Active state detection
  const isOnProjectsRoot =
    location.pathname === '/projects' || location.pathname === '/projects/new'

  // Matches /projects/:id and /projects/:id/edit — but NOT /projects/new
  const activeProjectIdMatch = location.pathname.match(
    /^\/projects\/([^/]+?)(?:\/edit)?$/
  )
  const activeProjectId =
    activeProjectIdMatch && activeProjectIdMatch[1] !== 'new'
      ? activeProjectIdMatch[1]
      : null

  return (
    <aside className="w-[260px] flex-shrink-0 bg-navy flex flex-col h-screen sticky top-0 overflow-hidden border-r border-white/5">
      {/* Logo + user */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
        <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
          Field<span className="text-warning">Check</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 truncate">
          {user?.name || 'Field Worker'}
        </p>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto min-h-0">
        {/* All Projects link */}
        <button
          onClick={() => navigate('/projects')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left mb-1 text-sm font-semibold transition-colors
            ${isOnProjectsRoot
              ? 'bg-primary/20 text-blue-300 border-l-2 border-primary pl-[10px]'
              : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent pl-[10px]'
            }`}
        >
          <List size={15} className="flex-shrink-0" />
          <span>All Projects</span>
        </button>

        <div className="h-px bg-white/10 my-2 mx-1" />

        {/* Project nav items */}
        {isLoading ? (
          // Skeleton — 3 placeholder items while projects load
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 h-2.5 bg-white/10 animate-pulse rounded-full" />
            </div>
          ))
        ) : projects.length === 0 ? (
          <p className="text-xs text-slate-600 px-3 py-2">No projects yet</p>
        ) : (
          projects.map((project) => {
            const isActive = activeProjectId === project.id
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left mb-0.5 transition-colors group
                  ${isActive
                    ? 'bg-primary/20 text-white border-l-2 border-primary pl-[10px]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent pl-[10px]'
                  }`}
              >
                <ProgressRing
                  percentage={project.completion_percentage}
                  size={30}
                  strokeWidth={3}
                  className="flex-shrink-0"
                />
                <span className="truncate text-sm font-medium leading-tight">
                  {project.name}
                </span>
              </button>
            )
          })
        )}
      </nav>

      {/* Footer: New Project + Sign out */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10 flex-shrink-0 flex flex-col gap-2">
        <button
          onClick={() => navigate('/projects/new')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 text-xs font-medium transition-colors"
        >
          <LogOut size={13} />
          {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
