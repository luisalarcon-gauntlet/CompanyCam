import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      const token = data.data?.token
      const user = data.data?.user
      if (token && user) {
        setAuth(user, token)
        navigate('/projects')
      }
    },
    onError: () => {
      setError('Invalid email or password')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }
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
        <h2 className="text-2xl font-extrabold text-navy mb-6">Welcome back</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={mutation.isPending}
            className="mt-2"
          >
            Log In
          </Button>

          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Demo accounts</p>
            {[
              { label: 'Owner', email: 'demo@fieldcheck.app' },
              { label: 'Crew Lead', email: 'crew@fieldcheck.app' },
              { label: 'Tech', email: 'tech@fieldcheck.app' },
            ].map(({ label, email }) => (
              <button
                key={email}
                type="button"
                className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => setForm({ email, password: 'password123' })}
              >
                <span className="font-semibold text-navy">{label}</span>
                <span className="text-muted">{email}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
