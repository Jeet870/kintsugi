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

const STORAGE_KEY = 'kintsugi_journal_entries'

const INITIAL_DEMO_ENTRIES: JournalEntry[] = [
  {
    id: 'demo-entry-1',
    user_id: 1,
    title: 'Finding Calm in the Chaos',
    content:
      '<h2>Finding Calm in the Chaos</h2><p>Today was busy, but taking five minutes for guided breathing really brought back my focus. Reminded myself that progress takes time.</p><p>Capturing these quiet reflections allows me to process daily moments with clarity and self-compassion.</p>',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-entry-2',
    user_id: 1,
    title: 'Evening Reflection & Gratitude',
    content:
      '<h2>Evening Reflection & Gratitude</h2><p>Grateful for a quiet evening walk and supportive conversations with friends. Expressing emotions lightens the heavy days.</p><blockquote><p>“Small pauses throughout the day bring the greatest mental clarity.”</p></blockquote>',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

function getLocalJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ENTRIES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to parse local journal storage:', err)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ENTRIES))
  } catch {}
  return INITIAL_DEMO_ENTRIES
}

function saveLocalJournalEntries(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (err) {
    console.warn('Failed to save to local journal storage:', err)
  }
}

/**
 * Retrieves paginated encrypted journal entries owned by the user via GET /journal.
 * Content is transparently decrypted by the backend before returning.
 * Falls back to local storage when network connection fails.
 */
export async function list(params?: JournalListParams): Promise<JournalEntry[]> {
  try {
    const response = await apiClient.get<JournalEntry[]>(ENDPOINTS.JOURNAL.LIST, {
      params: {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 100,
      },
    })
    if (Array.isArray(response.data)) {
      saveLocalJournalEntries(response.data)
      return response.data
    }
  } catch (err) {
    console.warn('Backend journal list endpoint unavailable, returning offline local entries:', err)
  }
  return getLocalJournalEntries()
}

/**
 * Retrieves a single decrypted journal entry by ID via GET /journal/{id}.
 */
export async function getById(id: string | number): Promise<JournalEntry> {
  try {
    const response = await apiClient.get<JournalEntry>(ENDPOINTS.JOURNAL.DETAIL(String(id)))
    return response.data
  } catch (err) {
    console.warn(`Backend get journal entry ${id} unavailable, using local entry:`, err)
    const local = getLocalJournalEntries()
    const found = local.find((e) => String(e.id) === String(id))
    if (found) return found
    throw err
  }
}

/**
 * Creates a new encrypted journal entry via POST /journal.
 * Returns the persisted entry.
 */
export async function create(payload: CreateJournalPayload): Promise<JournalEntry> {
  try {
    const response = await apiClient.post<JournalEntry>(ENDPOINTS.JOURNAL.CREATE, payload)
    const created = response.data
    const local = getLocalJournalEntries()
    saveLocalJournalEntries([created, ...local.filter((e) => String(e.id) !== String(created.id))])
    return created
  } catch (err) {
    console.warn('Backend journal create endpoint unavailable, creating local entry:', err)
    const local = getLocalJournalEntries()
    const newEntry: JournalEntry = {
      id: 'local-' + Date.now(),
      user_id: 1,
      title: payload.title || 'Untitled Reflection',
      content: payload.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    saveLocalJournalEntries([newEntry, ...local])
    return newEntry
  }
}

/**
 * Updates an existing journal entry via PATCH /journal/{id}.
 * Re-encrypts updated content on the backend.
 */
export async function update(
  id: string | number,
  payload: UpdateJournalPayload,
): Promise<JournalEntry> {
  try {
    const response = await apiClient.patch<JournalEntry>(
      ENDPOINTS.JOURNAL.UPDATE(String(id)),
      payload,
    )
    const updated = response.data
    const local = getLocalJournalEntries()
    const updatedList = local.map((e) => (String(e.id) === String(id) ? { ...e, ...updated } : e))
    saveLocalJournalEntries(updatedList)
    return updated
  } catch (err) {
    console.warn(`Backend journal update endpoint ${id} unavailable, updating local entry:`, err)
    const local = getLocalJournalEntries()
    let resultEntry: JournalEntry | null = null
    const updatedList = local.map((e) => {
      if (String(e.id) === String(id)) {
        resultEntry = {
          ...e,
          title: payload.title !== undefined ? payload.title : e.title,
          content: payload.content !== undefined ? payload.content : e.content,
          updated_at: new Date().toISOString(),
        }
        return resultEntry
      }
      return e
    })

    if (!resultEntry) {
      resultEntry = {
        id,
        user_id: 1,
        title: payload.title || 'Untitled Reflection',
        content: payload.content || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      updatedList.unshift(resultEntry)
    }

    saveLocalJournalEntries(updatedList)
    return resultEntry
  }
}

/**
 * Deletes a journal entry by ID via DELETE /journal/{id}.
 */
export async function remove(id: string | number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.JOURNAL.DELETE(String(id)))
  } catch (err) {
    console.warn(`Backend journal delete endpoint ${id} unavailable, removing local entry:`, err)
  } finally {
    const local = getLocalJournalEntries()
    saveLocalJournalEntries(local.filter((e) => String(e.id) !== String(id)))
  }
}

export const journalApi = {
  list,
  getById,
  create,
  update,
  remove,
}

export default journalApi

