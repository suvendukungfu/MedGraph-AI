import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

import { useAuthStore } from '../store/authStore'

httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; error?: string }>) => {
    const apiMessage =
      error.response?.data?.detail ??
      error.response?.data?.error ??
      error.message ??
      'Unexpected network error'

    return Promise.reject(new Error(apiMessage))
  },
)

export { API_BASE_URL }
