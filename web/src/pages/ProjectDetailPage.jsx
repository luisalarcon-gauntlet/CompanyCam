import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Plus, CheckCircle } from 'lucide-react'
import { projectsApi, checklistsApi } from '../services/api'
import { TradeBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Confetti } from '../components/ui/Confetti'
import { ChecklistSection } from '../components/checklist/ChecklistSection'
import { CreateChecklistSheet } from '../components/checklist/CreateChecklistSheet'
import { VoiceCheckoffSheet } from '../components/ai/VoiceCheckoffSheet'
import { PhotoCheckoffSheet } from '../components/ai/PhotoCheckoffSheet'
import { AskSheet } from '../components/ai/AskSheet'
import { AIActionBar } from '../components/ai/AIActionBar'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useOfflineStore } from '../stores/offlineStore'
import { toast } from '../components/ui/toastStore'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isOnline = useNetworkStatus()

  const [showDeleteProject, setShowDeleteProject] = useState(false)
  const [showCreateChecklist, setShowCreateChecklist] = useState(false)
  const [deleteChecklistTarget, setDeleteChecklistTarget] = useState(null)

  const [showVoice, setShowVoice] = useState(false)
  const [showPhoto, setShowPhoto] = useState(false)
  const [showAsk, setShowAsk] = useState(false)

  const [activeChecklistId, setActiveChecklistId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const prevAllDoneRef = useRef(false)

  const { cacheProjectData } = useOfflineStore()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id),
    select: (res) => res.data.data,
  })

  useEffect(() => {
    if (project) {
      cacheProjectData(project)
    }
  }, [project]) // eslint-disable-line react-hooks/exhaustive-deps

  const allDone = project?.total_items_count > 0 &&
    project?.completed_items_count === project?.total_items_count

  useEffect(() => {
    if (allDone && !prevAllDoneRef.current) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }
    prevAllDoneRef.current = allDone
  }, [allDone])

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast('Project deleted')
      navigate('/projects')
    },
    onError: () => toast('Failed to delete project', 'error'),
  })

  const deleteChecklistMutation = useMutation({
    mutationFn: (checklistId) => checklistsApi.delete(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast('Checklist deleted')
      setDeleteChecklistTarget(null)
    },
    onError: () => toast('Failed to delete checklist', 'error'),
  })

  const getBestChecklist = () => {
    const checklists = project?.checklists || []
    const withIncomplete = checklists.find(cl =>
      cl.items?.some(i => i.status !== 'complete')
    )
    return withIncomplete || checklists[0] || null
  }

  const handleAiAction = (setter) => () => {
    if (!isOnline) {
      toast('Needs internet — AI features require a connection', 'warning')
      return
    }
    const cl = getBestChecklist()
    if (!cl) {
      toast('No checklists found — add a checklist first', 'warning')
      return
    }
    setActiveChecklistId(cl.id)
    setter(true)
  }

  const handleAskOpen = () => {
    if (!isOnline) {
      toast('Needs internet — AI features require a connection', 'warning')
      return
    }
    setShowAsk(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col max-w-[720px] mx-auto xl:max-w-none xl:mx-0">
        <div className="bg-navy h-32 animate-pulse" />
        <div className="px-4 py-4 flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl h-24 border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Project not found</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    )
  }

  const hasItems = project.total_items_count > 0
  const activeChecklist = project.checklists?.find(cl => cl.id === activeChecklistId)

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-[720px] mx-auto xl:max-w-none xl:mx-0">
      <Confetti active={showConfetti} />

      {/* ── Header ── */}
      <div className="bg-navy px-4 safe-top pt-safe-top pb-4">
        <div className="flex items-center justify-between h-14">
          {/* Back arrow — hidden on desktop (sidebar provides navigation) */}
          <button
            onClick={() => navigate('/projects')}
            className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 xl:hidden"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          {/* Spacer on desktop so actions stay right-aligned */}
          <div className="hidden xl:block flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10"
              aria-label="Edit project"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => setShowDeleteProject(true)}
              className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-red-500/20"
              aria-label="Delete project"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Project info */}
        <div className="pb-2">
          <TradeBadge tradeType={project.trade_type} className="mb-2" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight break-words">
            {project.name}
          </h1>
          {project.address && (
            <p className="text-slate-400 text-sm mt-1 break-words">{project.address}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-slate-300 text-sm font-medium">
              {project.completed_items_count} of {project.total_items_count} items complete
            </span>
            <span className="text-white text-sm font-bold">
              {project.completion_percentage}%
            </span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${allDone ? 'bg-success' : 'bg-warning'}`}
              style={{ width: `${project.completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Celebration banner */}
      {allDone && (
        <div className="mx-4 mt-4 bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} className="text-success" />
          </div>
          <div>
            <p className="font-extrabold text-success text-lg">Job Complete!</p>
            <p className="text-sm text-green-700">Every checklist item is complete. Great work! 🎉</p>
          </div>
        </div>
      )}

      {/* ── Body: checklists + desktop AI panel ── */}
      <div className="flex-1 xl:flex xl:items-start">

        {/* Checklists */}
        <div className="flex-1 min-w-0 px-4 py-4 pb-36 xl:pb-8">
          {(project.checklists || []).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">No checklists yet</p>
              <Button onClick={() => setShowCreateChecklist(true)}>
                <Plus size={18} />
                Add First Checklist
              </Button>
            </div>
          ) : (
            <>
              {(project.checklists || []).map((cl) => (
                <ChecklistSection
                  key={cl.id}
                  checklist={cl}
                  projectId={id}
                  onDeleteConfirm={setDeleteChecklistTarget}
                />
              ))}
            </>
          )}

          {(project.checklists || []).length > 0 && (
            <button
              onClick={() => setShowCreateChecklist(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-primary font-semibold border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 min-h-[48px]"
            >
              <Plus size={18} />
              Add Checklist
            </button>
          )}
        </div>

        {/* Desktop AI right panel — sticky top-0 h-screen so it stays visible while checklists scroll */}
        <aside className="hidden xl:flex flex-col w-[280px] flex-shrink-0 bg-navy-mid border-l border-slate-800 sticky top-0 h-screen overflow-y-auto">
          <AIActionBar
            mode="panel"
            hasItems={hasItems}
            isOnline={isOnline}
            onVoice={handleAiAction(setShowVoice)}
            onPhoto={handleAiAction(setShowPhoto)}
            onAsk={handleAskOpen}
          />
        </aside>
      </div>

      {/* ── Mobile / tablet AI bar (hidden on desktop) ── */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 max-w-[720px] mx-auto z-30">
        <AIActionBar
          mode="bar"
          hasItems={hasItems}
          isOnline={isOnline}
          onVoice={handleAiAction(setShowVoice)}
          onPhoto={handleAiAction(setShowPhoto)}
          onAsk={handleAskOpen}
        />
      </div>

      {/* ── AI Sheets ── */}
      <VoiceCheckoffSheet
        isOpen={showVoice}
        onClose={() => setShowVoice(false)}
        checklist={activeChecklist}
        projectId={id}
      />
      <PhotoCheckoffSheet
        isOpen={showPhoto}
        onClose={() => setShowPhoto(false)}
        checklist={activeChecklist}
        projectId={id}
      />
      <AskSheet
        isOpen={showAsk}
        onClose={() => setShowAsk(false)}
        projectId={id}
      />

      {/* Create Checklist Sheet */}
      <CreateChecklistSheet
        isOpen={showCreateChecklist}
        onClose={() => setShowCreateChecklist(false)}
        projectId={id}
        tradeType={project.trade_type}
      />

      {/* Delete Project Confirmation */}
      <BottomSheet
        isOpen={showDeleteProject}
        onClose={() => setShowDeleteProject(false)}
        title="Delete Project"
      >
        <div className="flex flex-col gap-4">
          <p className="text-navy">
            Delete <strong>{project.name}</strong>? This can&apos;t be undone — all checklists
            and items will be permanently removed.
          </p>
          <Button
            variant="danger"
            fullWidth
            size="lg"
            loading={deleteProjectMutation.isPending}
            onClick={() => deleteProjectMutation.mutate()}
          >
            <Trash2 size={18} />
            Yes, Delete Project
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowDeleteProject(false)}
          >
            Cancel
          </Button>
        </div>
      </BottomSheet>

      {/* Delete Checklist Confirmation */}
      <BottomSheet
        isOpen={!!deleteChecklistTarget}
        onClose={() => setDeleteChecklistTarget(null)}
        title="Delete Checklist"
      >
        <div className="flex flex-col gap-4">
          <p className="text-navy">
            Delete <strong>{deleteChecklistTarget?.name}</strong> and all its items?
          </p>
          <Button
            variant="danger"
            fullWidth
            size="lg"
            loading={deleteChecklistMutation.isPending}
            onClick={() => deleteChecklistMutation.mutate(deleteChecklistTarget?.id)}
          >
            <Trash2 size={18} />
            Yes, Delete Checklist
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setDeleteChecklistTarget(null)}
          >
            Cancel
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
