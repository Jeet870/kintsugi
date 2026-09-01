import apiClient from '@/lib/api/apiClient'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { JournalEntry } from '@/types/api'

export interface CreateJournalPayload {
  title: string
  content: string
}

export interface UpdateJournalPayload {
  title?: string
  content?: string
}

export interface JournalListParams {
  skip?: number
  limit?: number
}

/**
 * Retrieves paginated encrypted journal entries owned by the user via GET /journal.
 * Content is transparently decrypted by the backend before returning.
 */
export async function list(params?: JournalListParams): Promise<JournalEntry[]> {
  const response = await apiClient.get<JournalEntry[]>(ENDPOINTS.JOURNAL.LIST, {
    params: {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
    },
  })
  return response.data
}

/**
 * Retrieves a single decrypted journal entry by ID via GET /journal/{id}.
 */
export async function getById(id: string | number): Promise<JournalEntry> {
  const response = await apiClient.get<JournalEntry>(ENDPOINTS.JOURNAL.DETAIL(String(id)))
  return response.data
}

/**
 * Creates a new encrypted journal entry via POST /journal.
 * Returns the persisted entry.
 */
export async function create(payload: CreateJournalPayload): Promise<JournalEntry> {
  const response = await apiClient.post<JournalEntry>(ENDPOINTS.JOURNAL.CREATE, payload)
  return response.data
}

/**
 * Updates an existing journal entry via PATCH /journal/{id}.
 * Re-encrypts updated content on the backend.
 */
export async function update(
  id: string | number,
  payload: UpdateJournalPayload,
): Promise<JournalEntry> {
  const response = await apiClient.patch<JournalEntry>(
    ENDPOINTS.JOURNAL.UPDATE(String(id)),
    payload,
  )
  return response.data
}

/**
 * Deletes a journal entry by ID via DELETE /journal/{id}.
 */
export async function remove(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.JOURNAL.DELETE(String(id)))
}

export const journalApi = {
  list,
  getById,
  create,
  update,
  remove,
}

export default journalApi
