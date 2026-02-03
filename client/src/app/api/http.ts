import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const ACCESS_TOKEN_KEY = 'doubt_connect_access_token'

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
    else localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // ignore
  }
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

let accessToken: string | null = getStoredToken()

export function setAccessToken(token: string | null) {
  accessToken = token
  setStoredToken(token)
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshing: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const res = await api.post<{ accessToken: string | null }>('/api/auth/refresh')
  const token = res.data.accessToken
  if (!token) throw new Error('No session')
  return token
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as { _retry?: boolean; url?: string }
    const status = error?.response?.status
    const isRefreshRequest = original?.url?.includes?.('/api/auth/refresh')
    const isLoginRequest = original?.url?.includes?.('/api/auth/login')

    // Do not retry for refresh or login 401 (show actual error to user)
    if (status === 401 && !original?._retry && !isRefreshRequest && !isLoginRequest) {
      original._retry = true
      try {
        refreshing = refreshing ?? refreshAccessToken()
        const newToken = await refreshing
        setAccessToken(newToken)
        refreshing = null
        return api(original)
      } catch (e) {
        refreshing = null
        setAccessToken(null)
        return Promise.reject(e)
      }
    }

    return Promise.reject(error)
  },
)

