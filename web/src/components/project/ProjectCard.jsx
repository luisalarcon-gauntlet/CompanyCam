import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TradeBadge } from '../ui/Badge'
import { ProgressRing } from '../ui/ProgressRing'
import { useBreakpoint } from '../../hooks/useBreakpoint'

export function ProjectCard({ project }) {
  const navigate = useNavigate()
  const { isDesktop } = useBreakpoint()

  return (
    <button
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 flex flex-col
                 active:bg-slate-50 transition-all cursor-pointer
                 hover:border-primary/30
                 xl:hover:shadow-md xl:hover:shadow-slate-200/80 xl:hover:-translate-y-0.5"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Progress Ring — larger on desktop */}
        <ProgressRing
          percentage={project.completion_percentage}
          size={isDesktop ? 64 : 52}
          strokeWidth={isDesktop ? 5 : 4}
          className="flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-navy text-base leading-tight truncate">
            {project.name}
          </h3>
          {project.address && (
            <p className="text-sm text-muted flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{project.address}</span>
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <TradeBadge tradeType={project.trade_type} />
            <span className="text-xs text-muted">
              {project.completed_items_count}/{project.total_items_count} done
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar — visible on desktop cards for at-a-glance status */}
      <div className="hidden xl:block mt-3">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out
              ${project.completion_percentage === 100 ? 'bg-success' : 'bg-warning'}`}
            style={{ width: `${project.completion_percentage}%` }}
          />
        </div>
      </div>
    </button>
  )
}
