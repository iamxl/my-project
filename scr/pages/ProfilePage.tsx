import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, bookingApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTelegram } from '../hooks/useTelegram'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { tg } = useTelegram()
  const navigate = useNavigate()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  })

  const { data: bookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingApi.getMyBookings(),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (tg) {
      tg.BackButton.show()
      tg.BackButton.onClick(() => {
        navigate('/booking')
      })
      return () => {
        tg.BackButton.hide()
      }
    }
  }, [tg, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4">Профиль</h1>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600">Имя</p>
              <p className="font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            {user?.username && (
              <div>
                <p className="text-gray-600">Username</p>
                <p className="font-semibold">@{user.username}</p>
              </div>
            )}
            {user?.phone && (
              <div>
                <p className="text-gray-600">Телефон</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Статистика</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {profile.statistics.totalBookings}
                </p>
                <p className="text-gray-600">Всего бронирований</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {profile.statistics.upcomingBookings}
                </p>
                <p className="text-gray-600">Предстоящих</p>
              </div>
            </div>
          </div>
        )}

        {bookings && bookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Последние бронирования</h2>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <p className="font-semibold">{booking.room}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startTime).toLocaleString('ru-RU')} -{' '}
                    {new Date(booking.endTime).toLocaleString('ru-RU')}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/booking')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Забронировать комнату
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}

