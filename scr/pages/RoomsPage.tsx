import { useQuery } from '@tanstack/react-query'
import { bookingApi } from '../services/api'

export function RoomsPage() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => bookingApi.getRooms(),
  })

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
        <h1 className="text-2xl font-bold mb-6">Комнаты</h1>
        <div className="space-y-4">
          {rooms?.map((room: any) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              {room.description && (
                <p className="text-gray-600">{room.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

