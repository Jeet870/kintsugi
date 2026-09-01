import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useChatHistory(sessionId: number = 1) {
  return useQuery({
    queryKey: ['chat', sessionId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/api/v1/chat/sessions/${sessionId}`)
      if (!res.ok) throw new Error('Failed to fetch chat history')
      return res.json()
    },
  })
}

export function useSendChatMessage(sessionId: number = 1) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`http://localhost:8000/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onMutate: async (newText) => {
      await queryClient.cancelQueries({ queryKey: ['chat', sessionId] })
      const previousMessages = queryClient.getQueryData(['chat', sessionId]) || []
      queryClient.setQueryData(['chat', sessionId], (old: any) => [
        ...(old || []),
        { role: 'user', content: newText, pending: true },
      ])
      return { previousMessages }
    },
    onError: (_err, _newText, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', sessionId], context.previousMessages)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', sessionId] })
    },
  })
}
