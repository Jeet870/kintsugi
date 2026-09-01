import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useMoodList() {
  return useQuery({
    queryKey: ['moods'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/v1/mood')
      if (!res.ok) throw new Error('Failed to fetch mood entries')
      return res.json()
    },
  })
}

export function useCreateMood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { mood_type: string; note?: string }) => {
      const res = await fetch('http://localhost:8000/api/v1/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to create mood check-in')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}
