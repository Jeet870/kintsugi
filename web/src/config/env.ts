import { z } from 'zod'

/**
 * Zod validation schema for frontend environment variables.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .min(1, { message: 'VITE_API_BASE_URL must be a non-empty string.' })
    .url({ message: 'VITE_API_BASE_URL must be a valid HTTP/HTTPS URL.' }),
  VITE_WS_BASE_URL: z
    .string()
    .trim()
    .min(1, { message: 'VITE_WS_BASE_URL must be a non-empty string.' })
    .refine(
      (val) => val.startsWith('ws://') || val.startsWith('wss://') || val.startsWith('http://') || val.startsWith('https://'),
      { message: 'VITE_WS_BASE_URL must be a valid WebSocket (ws:// or wss://) or HTTP URL.' },
    ),
})

const defaultApiUrl = 'http://localhost:8000/api/v1'
const defaultWsUrl = 'ws://localhost:8000/ws'

/**
 * Raw environment values from import.meta.env with fallback defaults.
 */
const rawEnv = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || defaultApiUrl,
  VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || defaultWsUrl,
}

const parsed = envSchema.safeParse(rawEnv)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  const errorMessage =
    `\n⚠️ Invalid or missing environment configuration:\n${issues}\n\n` +
    `Using default fallback configuration.\n`

  // eslint-disable-next-line no-console
  console.warn(errorMessage)
}

const validData = parsed.success
  ? parsed.data
  : { VITE_API_BASE_URL: defaultApiUrl, VITE_WS_BASE_URL: defaultWsUrl }

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
