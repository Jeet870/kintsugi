import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeChannel() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Establish real-time connection channel or fallback polling event dispatch
    const wsUrl = 'ws://localhost:8000/ws'
    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(wsUrl)
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'mood.generated') {
            queryClient.invalidateQueries({ queryKey: ['moods'] })
          } else if (payload.type === 'chat.reply') {
            queryClient.invalidateQueries({ queryKey: ['chat'] })
          } else if (payload.type === 'streak.updated') {
            queryClient.invalidateQueries({ queryKey: ['user'] })
          } else if (payload.type === 'achievement.unlocked') {
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
          }
        } catch (err) {
          console.debug('Realtime event parse error:', err)
        }
      }
    } catch {
      console.debug('WebSocket unavailable, running in standard HTTP mode.')
    }

    return () => {
      if (ws) ws.close()
    }
  }, [queryClient])
}
