import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { Toaster } from './components/ui/Toast'
import { OfflineBanner } from './components/ui/OfflineBanner'
import { Layout } from './components/layout/Layout'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectFormPage from './pages/ProjectFormPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/projects" replace />
  return children
}

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/projects' : '/login'} replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineBanner />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Protected routes — wrapped in Layout for responsive sidebar */}
          <Route
            path="/projects"
            element={<ProtectedRoute><Layout><ProjectsPage /></Layout></ProtectedRoute>}
          />
          <Route
            path="/projects/new"
            element={<ProtectedRoute><Layout><ProjectFormPage /></Layout></ProtectedRoute>}
          />
          <Route
            path="/projects/:id"
            element={<ProtectedRoute><Layout><ProjectDetailPage /></Layout></ProtectedRoute>}
          />
          <Route
            path="/projects/:id/edit"
            element={<ProtectedRoute><Layout><ProjectFormPage /></Layout></ProtectedRoute>}
          />

          {/* Redirect root: login when guest, projects when authenticated */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
