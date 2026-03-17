import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function SignupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.token)
      navigate('/projects')
    },
    onError: (err) => {
      const serverErrors = err.response?.data?.errors || ['Something went wrong']
      const fieldErrors = {}
      serverErrors.forEach((msg) => {
        if (msg.toLowerCase().includes('email')) fieldErrors.email = msg
        else if (msg.toLowerCase().includes('password')) fieldErrors.password = msg
        else if (msg.toLowerCase().includes('name')) fieldErrors.name = msg
        else fieldErrors.general = msg
      })
      setErrors(fieldErrors)
    },
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.password_confirmation) {
      e.password_confirmation = "Passwords don't match"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate(form)
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Field<span className="text-warning">Check</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Your AI-powered job site checklist
        </p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-surface rounded-t-3xl px-6 pt-8 pb-6">
        <h2 className="text-2xl font-extrabold text-navy mb-6">Create account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Mike Johnson"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            autoComplete="name"
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="8+ characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            error={errors.password_confirmation}
            autoComplete="new-password"
          />

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
            className="mt-2"
          >
            Create Account
          </Button>

          <p className="text-center text-muted text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
