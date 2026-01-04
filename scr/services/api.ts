import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  login: async (initData: string, phone?: string) => {
    const response = await api.post('/auth/telegram', { initData, phone })
    return response.data
  },
  verifyToken: async (token: string) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },
  getProfile: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await api.get('/profile', { headers })
    return response.data
  },
}

export const bookingApi = {
  getRooms: async () => {
    const response = await api.get('/booking/rooms')
    return response.data
  },
  getAvailability: async (roomId: number, date: string) => {
    const response = await api.get(`/booking/rooms/${roomId}/availability`, {
      params: { date },
    })
    return response.data
  },
  createBooking: async (roomId: number, startTime: string, endTime: string) => {
    const response = await api.post('/booking', {
      roomId,
      startTime,
      endTime,
    })
    return response.data
  },
  getMyBookings: async () => {
    const response = await api.get('/booking/my')
    return response.data
  },
  cancelBooking: async (bookingId: number) => {
    const response = await api.delete(`/booking/${bookingId}`)
    return response.data
  },
}

export default api

