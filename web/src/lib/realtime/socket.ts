import { env } from '@/config/env'

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'

export type EventHandler<T = any> = (payload: T) => void

export interface RealtimeEvent<T = unknown> {
  type: string
  payload?: T
  data?: T
}

const PING_INTERVAL_MS = 25000
const INITIAL_RECONNECT_DELAY_MS = 1000
const MAX_RECONNECT_DELAY_MS = 30000
const MAX_RECONNECT_ATTEMPTS = 5

export class RealtimeSocket {
  private ws: WebSocket | null = null
  private connectionState: ConnectionState = 'idle'
  private subscribers: Map<string, Set<EventHandler>> = new Map()

  private activeToken: string | null = null
  private explicitDisconnect = false
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  /**
   * Connect to the FastAPI WebSocket server using an authenticated JWT token.
   */
  connect(token: string): WebSocket | null {
    if (!token) return null

    this.activeToken = token
    this.explicitDisconnect = false

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return this.ws
    }

    this.connectionState = this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting'

    try {
      const wsUrl = `${env.WS_BASE_URL}?token=${encodeURIComponent(token)}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.connectionState = 'connected'
        this.reconnectAttempt = 0
        this.startHeartbeat()
        this.dispatchInternal('open', { connected: true })
      }

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = () => {
        // Handled in onclose
      }

      this.ws.onclose = (event: CloseEvent) => {
        this.stopHeartbeat()
        this.ws = null

        if (this.explicitDisconnect || event.code === 1000) {
          this.connectionState = 'idle'
          this.dispatchInternal('close', { code: event.code })
          return
        }

        this.connectionState = 'disconnected'
        this.scheduleReconnect()
      }

      return this.ws
    } catch {
      this.connectionState = 'disconnected'
      this.scheduleReconnect()
      return null
    }
  }

  /**
   * Explicitly disconnect and terminate the WebSocket session (e.g. on logout).
   */
  disconnect(): void {
    this.explicitDisconnect = true
    this.activeToken = null
    this.stopHeartbeat()
    this.cancelReconnectTimer()

    if (this.ws) {
      const socketToClose = this.ws
      socketToClose.onopen = null
      socketToClose.onmessage = null
      socketToClose.onerror = null
      socketToClose.onclose = null

      try {
        if (
          socketToClose.readyState === WebSocket.OPEN ||
          socketToClose.readyState === WebSocket.CONNECTING
        ) {
          socketToClose.close(1000, 'Explicit disconnect')
        }
      } catch {
        // Suppress close error
      }
      this.ws = null
    }

    this.connectionState = 'idle'
  }

  /**
   * Manually trigger a reconnection attempt.
   */
  reconnect(): void {
    if (this.activeToken) {
      this.disconnect()
      this.connect(this.activeToken)
    }
  }

  /**
   * Send a JSON event payload to the WebSocket server.
   */
  send(eventType: string, payload?: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const frame = JSON.stringify({ type: eventType, payload })
      this.ws.send(frame)
    }
  }

  /**
   * Subscribe to a specific realtime event type. Returns an unsubscribe cleanup function.
   */
  subscribe<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set())
    }
    this.subscribers.get(eventType)!.add(handler)

    return () => {
      this.unsubscribe(eventType, handler)
    }
  }

  /**
   * Unsubscribe a handler from a specific event type.
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.subscribers.delete(eventType)
      }
    }
  }

  /* Helper aliases for event subscription */
  on<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    return this.subscribe(eventType, handler)
  }

  off(eventType: string, handler: EventHandler): void {
    this.unsubscribe(eventType, handler)
  }

  /**
   * Check if the socket is currently connected and open.
   */
  isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Get the current connection status.
   */
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  /* ─── Private Internal Methods ─── */

  private handleMessage(rawMessage: string): void {
    try {
      const parsed: RealtimeEvent = JSON.parse(rawMessage)
      const eventType = parsed.type || 'message'
      const data = parsed.payload !== undefined ? parsed.payload : parsed.data !== undefined ? parsed.data : parsed

      if (eventType === 'pong') return

      this.dispatchInternal(eventType, data)
    } catch {
      this.dispatchInternal('message', rawMessage)
    }
  }

  private dispatchInternal(eventType: string, data: unknown): void {
    const handlers = this.subscribers.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`[RealtimeSocket] Error in handler for event "${eventType}":`, e)
        }
      })
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, PING_INTERVAL_MS)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.explicitDisconnect || !this.activeToken) return
    if (this.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) return

    this.cancelReconnectTimer()

    const delay = Math.min(
      MAX_RECONNECT_DELAY_MS,
      INITIAL_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempt),
    )
    const jitter = Math.random() * 1000
    const totalDelay = delay + jitter

    this.reconnectAttempt++

    this.reconnectTimer = setTimeout(() => {
      if (this.activeToken && !this.explicitDisconnect) {
        this.connect(this.activeToken)
      }
    }, totalDelay)
  }

  private cancelReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/* ─── Export Singleton Instance & Aliases ─── */
export const realtimeSocket = new RealtimeSocket()
export const socket = realtimeSocket
export default realtimeSocket
