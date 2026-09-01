import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import { socket } from '@/lib/realtime/socket'
import { useNotificationRealtimeSync } from '@/lib/realtime/useNotificationRealtimeSync'

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

export interface RealtimeContextValue {
  status: ConnectionStatus
  isConnected: boolean
  lastConnectedAt?: Date
  lastDisconnectedAt?: Date
  reconnectAttempts: number
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined)

export interface RealtimeProviderProps {
  children: React.ReactNode
}

const MAX_RECONNECT_ATTEMPTS = 5
const BASE_RECONNECT_DELAY_MS = 1000
const MAX_RECONNECT_DELAY_MS = 30000

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const isAuthenticated = useAuthStore((state) => state.authenticated)

  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | undefined>(undefined)
  const [lastDisconnectedAt, setLastDisconnectedAt] = useState<Date | undefined>(undefined)
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0)

  const isIntentionalDisconnectRef = useRef<boolean>(false)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Call notification sync exactly once */
  useNotificationRealtimeSync()

  useEffect(() => {
    if (!isAuthenticated) {
      isIntentionalDisconnectRef.current = true
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      socket.disconnect()
      setStatus('idle')
      setReconnectAttempts(0)
      return
    }

    const token = tokenStorage.getAccessToken()
    if (!token) {
      setStatus('idle')
      return
    }

    isIntentionalDisconnectRef.current = false

    function connectSocket(attemptNumber: number = 0) {
      const activeToken = tokenStorage.getAccessToken()
      if (!activeToken || isIntentionalDisconnectRef.current) return

      if (attemptNumber === 0) {
        setStatus('connecting')
      } else {
        setStatus('reconnecting')
      }

      const ws = socket.connect(activeToken)
      if (!ws) {
        setStatus('disconnected')
        return
      }

      ws.onopen = () => {
        if (isIntentionalDisconnectRef.current) return
        setStatus('connected')
        setLastConnectedAt(new Date())
        setReconnectAttempts(0)
      }

      ws.onclose = (event: CloseEvent) => {
        setLastDisconnectedAt(new Date())

        if (isIntentionalDisconnectRef.current || event.code === 1000) {
          setStatus('idle')
          return
        }

        setStatus('disconnected')

        if (attemptNumber < MAX_RECONNECT_ATTEMPTS) {
          const nextAttempt = attemptNumber + 1
          setReconnectAttempts(nextAttempt)

          // Exponential backoff with jitter
          const expDelay = Math.min(
            MAX_RECONNECT_DELAY_MS,
            BASE_RECONNECT_DELAY_MS * Math.pow(2, attemptNumber),
          )
          const jitter = Math.random() * 1000
          const delay = expDelay + jitter

          reconnectTimerRef.current = setTimeout(() => {
            connectSocket(nextAttempt)
          }, delay)
        }
      }

      ws.onerror = () => {
        // ws.onclose handles state cleanup
      }
    }

    connectSocket(0)

    return () => {
      isIntentionalDisconnectRef.current = true
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      socket.disconnect()
      setStatus('idle')
    }
  }, [isAuthenticated])

  const contextValue = useMemo<RealtimeContextValue>(
    () => ({
      status,
      isConnected: status === 'connected',
      lastConnectedAt,
      lastDisconnectedAt,
      reconnectAttempts,
    }),
    [status, lastConnectedAt, lastDisconnectedAt, reconnectAttempts],
  )

  return <RealtimeContext.Provider value={contextValue}>{children}</RealtimeContext.Provider>
}

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

export default RealtimeProvider
