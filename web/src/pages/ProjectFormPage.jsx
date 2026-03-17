import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { projectsApi } from '../services/api'
import { TRADE_TYPES } from '../constants/ai'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { toast } from '../components/ui/toastStore'

export default function ProjectFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    name: '',
    address: '',
    trade_type: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  // Load existing project for edit
  const { data: existingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id),
    select: (res) => res.data.data,
    enabled: isEdit,
  })

  useEffect(() => {
    if (existingProject) {
      setForm({
        name: existingProject.name || '',
        address: existingProject.address || '',
        trade_type: existingProject.trade_type || '',
        notes: existingProject.notes || '',
      })
    }
  }, [existingProject])

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? projectsApi.update(id, data) : projectsApi.create(data),
    onSuccess: (res) => {
      const project = res.data.data
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast(isEdit ? 'Project updated!' : 'Project created!', 'success')
      navigate(`/projects/${project.id}`)
    },
    onError: (err) => {
      const serverErrors = err.response?.data?.errors || ['Something went wrong']
      const e = {}
      serverErrors.forEach((msg) => {
        if (msg.toLowerCase().includes('name')) e.name = msg
        else e.general = msg
      })
      setErrors(e)
    },
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (form.name.length > 100) e.name = 'Name must be 100 characters or less'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate(form)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-[720px] mx-auto xl:max-w-none xl:mx-0">
      {/* Header */}
      <div className="bg-navy px-4 safe-top pt-safe-top">
        <div className="flex items-center gap-3 h-16">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Project Name *"
            placeholder="e.g. Johnson Residence Roof"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            maxLength={100}
            autoFocus
          />
          <Input
            label="Address"
            placeholder="e.g. 1842 Oak Street, Austin TX"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Select
            label="Trade Type"
            placeholder="Select a trade..."
            value={form.trade_type}
            onChange={(e) => setForm({ ...form, trade_type: e.target.value })}
            options={TRADE_TYPES}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-navy">Notes</label>
            <textarea
              placeholder="Any notes about the job..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-base text-navy bg-white focus:outline-none focus:border-primary hover:border-slate-300 placeholder:text-muted resize-none"
            />
          </div>

          {errors.general && (
            <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl">
              {errors.general}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={mutation.isPending}
            className="mt-4"
          >
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </form>
      </div>
    </div>
  )
}
