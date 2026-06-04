import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const tokenAPI = {
  book: (notes) => api.post('/tokens/book', { notes }),
  myTokens: () => api.get('/tokens/my'),
  status: (tokenNumber) => api.get(`/tokens/status/${tokenNumber}`),
}

export const queueAPI = {
  status: () => api.get('/queue/status'),
}

export const doctorAPI = {
  getQueue: () => api.get('/doctor/queue'),
  callNext: () => api.post('/doctor/call-next'),
  pause: () => api.post('/doctor/pause'),
  resume: () => api.post('/doctor/resume'),
  skip: (tokenNumber) => api.post(`/doctor/skip/${tokenNumber}`),
}

export const adminAPI = {
  patients: () => api.get('/admin/patients'),
  tokens: () => api.get('/admin/tokens'),
  stats: () => api.get('/admin/stats'),
  resetQueue: () => api.post('/admin/reset-queue'),
}

export default api
