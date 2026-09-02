import { z } from 'zod'

/**
 * Zod validation schema for frontend environment variables.
 */
const defaultApiUrl = 'https://kintsugi-50045507037.development.catalystappsail.in/api/v1'
const defaultWsUrl = 'wss://kintsugi-50045507037.development.catalystappsail.in/ws'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().optional(),
  VITE_WS_BASE_URL: z.string().optional(),
})

/**
 * Raw environment values from import.meta.env with fallback defaults.
 */
const rawEnv = {
  VITE_API_BASE_URL: (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim()) || defaultApiUrl,
  VITE_WS_BASE_URL: (import.meta.env.VITE_WS_BASE_URL && import.meta.env.VITE_WS_BASE_URL.trim()) || defaultWsUrl,
}

const parsed = envSchema.safeParse(rawEnv)

const validData = {
  VITE_API_BASE_URL: (parsed.success && parsed.data.VITE_API_BASE_URL) || defaultApiUrl,
  VITE_WS_BASE_URL: (parsed.success && parsed.data.VITE_WS_BASE_URL) || defaultWsUrl,
}

/**
 * Immutable strongly-typed application environment configuration.
 * Single source of truth — do not access import.meta.env directly.
 */
export const env = Object.freeze({
  API_BASE_URL: validData.VITE_API_BASE_URL,
  WS_BASE_URL: validData.VITE_WS_BASE_URL,
})

export type AppEnv = typeof env
export default env
