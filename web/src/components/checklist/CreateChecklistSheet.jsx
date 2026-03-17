import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Sparkles, ChevronRight } from 'lucide-react'
import { checklistsApi, templatesApi } from '../../services/api'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { toast } from '../ui/toastStore'

export function CreateChecklistSheet({ isOpen, onClose, projectId, tradeType }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [_step, setStep] = useState('name') // 'name' | 'template' (step reserved for future multi-step UI)

  const { data: templates = [] } = useQuery({
    queryKey: ['templates', tradeType],
    queryFn: () => templatesApi.list(tradeType),
    select: (res) => res.data.data,
    enabled: isOpen,
  })

  const mutation = useMutation({
    mutationFn: () => checklistsApi.create(projectId, { name }, selectedTemplateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast('Checklist created!', 'success')
      handleClose()
    },
    onError: () => toast('Failed to create checklist', 'error'),
  })

  const handleClose = () => {
    setName('')
    setSelectedTemplateId(null)
    setStep('name')
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate()
  }

  const tradeTemplates = templates.filter((t) =>
    !tradeType || t.trade_type === tradeType
  )

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="New Checklist">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Checklist Name"
          placeholder="e.g. Day 1, Pre-Install, Final Walkthrough"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Template suggestions */}
        {tradeTemplates.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-navy mb-2 flex items-center gap-1">
              <Sparkles size={14} className="text-ai-purple" />
              Load from template
            </p>
            <div className="flex flex-col gap-2">
              {tradeTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(selectedTemplateId === t.id ? null : t.id)
                    if (!name) setName(t.name)
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                    selectedTemplateId === t.id
                      ? 'border-ai-purple bg-violet-50'
                      : 'border-slate-200 hover:border-ai-purple/50'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-navy text-sm">{t.name}</p>
                    <p className="text-xs text-muted">{t.item_count} items</p>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={mutation.isPending}
          disabled={!name.trim()}
          className="mt-2"
        >
          {selectedTemplateId ? 'Create from Template' : 'Create Checklist'}
        </Button>
      </form>
    </BottomSheet>
  )
}
