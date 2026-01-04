import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTelegram } from '../hooks/useTelegram'

export function LoginPage() {
  const { tg, ready } = useTelegram()
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/profile')
    }
  }, [user, navigate])

  const handleLogin = async () => {
    if (!tg || !ready) {
      alert('Telegram Web App не загружен')
      return
    }

    try {
      await login(tg.initData)
      navigate('/profile')
    } catch (error) {
      console.error('Login error:', error)
      alert('Ошибка авторизации')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          PlayStation Club 🎮
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Добро пожаловать! Войдите через Telegram для продолжения.
        </p>
        <button
          onClick={handleLogin}
          disabled={!ready}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ready ? 'Войти через Telegram' : 'Загрузка...'}
        </button>
      </div>
    </div>
  )
}

