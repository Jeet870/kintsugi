export interface SuggestedPromptItem {
  readonly id: string
  readonly title: string
  readonly prompt: string
  readonly category: string
}

/**
 * Centralized Single Source of Truth for AI Companion Conversation Starters.
 */
export const SUGGESTED_PROMPTS: readonly SuggestedPromptItem[] = Object.freeze([
  {
    id: 'hard_day',
    title: "I've had a hard day",
    prompt: "I've had a hard day today and would love help processing my emotions.",
    category: 'Decompression',
  },
  {
    id: 'just_talk',
    title: 'Just want to talk',
    prompt: 'I just want to talk and share what is on my mind right now.',
    category: 'Active Listening',
  },
  {
    id: 'feeling_anxious',
    title: "I'm feeling anxious",
    prompt: "I'm feeling anxious right now. Could you guide me through a calming grounding exercise?",
    category: 'Grounding',
  },
  {
    id: 'help_reflect',
    title: 'Help me reflect today',
    prompt: 'Help me reflect on my day and identify any small wins or growth opportunities.',
    category: 'Self-Reflection',
  },
])

export default SUGGESTED_PROMPTS
