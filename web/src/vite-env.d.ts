/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables.
 * Ensures strict typing for import.meta.env across the frontend application.
 */
interface ImportMetaEnv {
  /**
   * The base URL for the FastAPI HTTP API server endpoints.
   * @example "http://localhost:8000/api/v1"
   */
  readonly VITE_API_BASE_URL: string

  /**
   * The base URL for the FastAPI WebSocket communication endpoints.
   * @example "ws://localhost:8000/ws"
   */
  readonly VITE_WS_BASE_URL: string
}

interface ImportMeta {
  /**
   * Strongly-typed environment metadata object provided by Vite.
   */
  readonly env: ImportMetaEnv
}
