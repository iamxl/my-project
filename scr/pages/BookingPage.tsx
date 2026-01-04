import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '../services/api'
import { useTelegram } from '../hooks/useTelegram'
import { format } from 'date-fns'

export function BookingPage() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const { tg } = useTelegram()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => bookingApi.getRooms(),
  })

  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedRoom, selectedDate],
    queryFn: () => bookingApi.getAvailability(selectedRoom!, selectedDate),
    enabled: !!selectedRoom,
  })

  const createBookingMutation = useMutation({
    mutationFn: ({ roomId, startTime, endTime }: {
      roomId: number
      startTime: string
      endTime: string
    }) => bookingApi.createBooking(roomId, startTime, endTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      if (tg) {
        tg.showAlert('Бронирование создано успешно!')
      }
      navigate('/profile')
    },
    onError: (error: any) => {
      if (tg) {
        tg.showAlert(error.response?.data?.error || 'Ошибка при создании бронирования')
      }
    },
  })

  const handleBook = () => {
    if (!selectedRoom || !selectedSlot) return

    const [startTime, endTime] = selectedSlot.split('|')
    createBookingMutation.mutate({
      roomId: selectedRoom,
      startTime,
      endTime,
    })
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Бронирование комнаты</h1>

        {/* Выбор комнаты */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Выберите комнату</h2>
          {roomsLoading ? (
            <p>Загрузка...</p>
          ) : (
            <div className="space-y-2">
              {rooms?.map((room: any) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                    selectedRoom === room.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{room.name}</p>
                  {room.description && (
                    <p className="text-sm text-gray-600">{room.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Выбор даты */}
        {selectedRoom && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Выберите дату</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        )}

        {/* Доступные слоты */}
        {selectedRoom && availability && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Доступное время</h2>
            {availabilityLoading ? (
              <p>Загрузка...</p>
            ) : availability.availableSlots.length === 0 ? (
              <p className="text-gray-600">Нет доступных слотов на эту дату</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availability.availableSlots.map((slot: any) => {
                  const slotKey = `${slot.startTime}|${slot.endTime}`
                  const startTime = new Date(slot.startTime)
                  const timeStr = format(startTime, 'HH:mm')
                  return (
                    <button
                      key={slotKey}
                      onClick={() => setSelectedSlot(slotKey)}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        selectedSlot === slotKey
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {timeStr}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Кнопка бронирования */}
        {selectedRoom && selectedSlot && (
          <button
            onClick={handleBook}
            disabled={createBookingMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {createBookingMutation.isPending
              ? 'Создание...'
              : 'Забронировать'}
          </button>
        )}

        <button
          onClick={() => navigate('/profile')}
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Назад
        </button>
      </div>
    </div>
  )
}

