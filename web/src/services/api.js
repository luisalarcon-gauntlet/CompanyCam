import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fieldcheck_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fieldcheck_token')
      localStorage.removeItem('fieldcheck_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  signup: (data) => api.post('/auth/signup', { user: data }),
  login: (data) => api.post('/auth/login', { user: data }),
  logout: () => api.delete('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Projects
export const projectsApi = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', { project: data }),
  update: (id, data) => api.patch(`/projects/${id}`, { project: data }),
  delete: (id) => api.delete(`/projects/${id}`),
}

// Checklists
export const checklistsApi = {
  list: (projectId) => api.get(`/projects/${projectId}/checklists`),
  get: (id) => api.get(`/checklists/${id}`),
  create: (projectId, data, templateId) =>
    api.post(`/projects/${projectId}/checklists`, {
      checklist: data,
      template_id: templateId,
    }),
  update: (id, data) => api.patch(`/checklists/${id}`, { checklist: data }),
  delete: (id) => api.delete(`/checklists/${id}`),
}

// Checklist Items
export const itemsApi = {
  list: (checklistId) => api.get(`/checklists/${checklistId}/items`),
  get: (id) => api.get(`/items/${id}`),
  create: (checklistId, data) => api.post(`/checklists/${checklistId}/items`, { item: data }),
  update: (id, data) => api.patch(`/items/${id}`, { item: data }),
  delete: (id) => api.delete(`/items/${id}`),
  complete: (id, data) => api.post(`/items/${id}/complete`, data),
  uncomplete: (id) => api.post(`/items/${id}/uncomplete`),
}

// Templates
export const templatesApi = {
  list: (tradeType) => api.get('/templates', { params: { trade_type: tradeType } }),
  get: (id) => api.get(`/templates/${id}`),
}

// AI
export const aiApi = {
  voiceMatch: (data) => api.post('/ai/voice-match', data),
  photoMatch: (data) => api.post('/ai/photo-match', data),
  ask: (data) => api.post('/ai/ask', data),
}

// Photo uploads
export const uploadsApi = {
  photo: (imageData, imageMediaType) =>
    api.post('/uploads/photo', { image_data: imageData, image_media_type: imageMediaType }),
}

export default api
