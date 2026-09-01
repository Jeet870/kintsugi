export interface FeatureItem {
  readonly id: string
  readonly iconName: string
  readonly title: string
  readonly description: string
  readonly category: 'core' | 'ai' | 'wellness' | 'infrastructure'
}

export interface StepItem {
  readonly step: string
  readonly title: string
  readonly description: string
}

export interface TechItem {
  readonly name: string
  readonly category: string
  readonly description: string
  readonly badge: string
}

export interface SecurityPoint {
  readonly title: string
  readonly description: string
}

export interface FAQItem {
  readonly question: string
  readonly answer: string
}

export interface TestimonialItem {
  readonly quote: string
  readonly author: string
  readonly role: string
  readonly tag: string
}

export const FEATURES: readonly FeatureItem[] = [
  {
    id: 'ai-companion',
    iconName: 'MessageSquare',
    title: 'AI Companion',
    description: 'Empathetic 24/7 conversational companion trained on CBT & reflective therapy frameworks.',
    category: 'ai',
  },
  {
    id: 'mood-tracker',
    iconName: 'Heart',
    title: 'Mood Tracker',
    description: 'Log daily check-ins with emoji spectrum, notes, and visual trend trajectory analytics.',
    category: 'core',
  },
  {
    id: 'private-journal',
    iconName: 'BookOpen',
    title: 'Private Journal',
    description: 'Encrypted personal reflective journal with Markdown formatting and emotional guidance.',
    category: 'core',
  },
  {
    id: 'achievements',
    iconName: 'Award',
    title: 'Achievements & Milestones',
    description: 'Celebrate consistency with unlockable wellness badges and streak milestone tracking.',
    category: 'wellness',
  },
  {
    id: 'breathing',
    iconName: 'Wind',
    title: 'Breathing Exercises',
    description: 'Interactive animated breathing paces for immediate stress reduction and nervous system grounding.',
    category: 'wellness',
  },
  {
    id: 'emergency-support',
    iconName: 'PhoneCall',
    title: 'Emergency Support',
    description: 'Immediate access to verified 24/7 crisis helplines and automatic safety escalation.',
    category: 'wellness',
  },
  {
    id: 'daily-motivation',
    iconName: 'Sparkles',
    title: 'Daily Motivation',
    description: 'Rotating deterministic daily quotes and self-care wisdom synchronized across all users.',
    category: 'wellness',
  },
  {
    id: 'smart-notifications',
    iconName: 'Bell',
    title: 'Smart Notifications',
    description: 'Realtime WebSocket alerts for milestone rewards, check-in reminders, and crisis check-ins.',
    category: 'infrastructure',
  },
  {
    id: 'mood-analytics',
    iconName: 'TrendingUp',
    title: 'Mood Analytics',
    description: 'Deep visual charts identifying emotional patterns over weekly, monthly, and yearly cycles.',
    category: 'core',
  },
  {
    id: 'secure-encryption',
    iconName: 'ShieldCheck',
    title: 'Secure Encryption',
    description: '256-bit encryption ensuring your reflective thoughts and emotional data remain strictly private.',
    category: 'infrastructure',
  },
  {
    id: 'realtime-updates',
    iconName: 'Zap',
    title: 'Realtime WebSockets',
    description: 'Instant zero-latency cache synchronization powered by FastAPI WebSockets and TanStack Query.',
    category: 'infrastructure',
  },
  {
    id: 'offline-support',
    iconName: 'WifiOff',
    title: 'Offline Cache Resilience',
    description: 'Seamless offline state storage allowing journal writing and check-ins even without connectivity.',
    category: 'infrastructure',
  },
] as const

export const HOW_IT_WORKS: readonly StepItem[] = [
  {
    step: '01',
    title: 'Daily Check-In',
    description: 'Select your mood from our curated spectrum and add optional notes about your day.',
  },
  {
    step: '02',
    title: 'Reflect & Converse',
    description: 'Chat with our empathy-driven AI companion or record freeform journal reflections.',
  },
  {
    step: '03',
    title: 'Track Progress',
    description: 'Visualize emotional patterns, build positive streaks, and unlock wellness achievements.',
  },
  {
    step: '04',
    title: 'Heal & Grow',
    description: 'Embrace life’s imperfections through evidence-based mindfulness and continuous restoration.',
  },
] as const

export const TECHNOLOGY: readonly TechItem[] = [
  { name: 'React 19', category: 'Frontend', description: 'Latest React compiler & concurrent rendering engine', badge: 'v19' },
  { name: 'FastAPI', category: 'Backend', description: 'High-performance Python asynchronous REST API', badge: 'v0.115' },
  { name: 'Mistral AI', category: 'AI Engine', description: 'Enterprise LLM fine-tuned for empathetic conversation', badge: 'LLM' },
  { name: 'MySQL 8', category: 'Database', description: 'Relational storage with strict transactional guarantees', badge: 'SQL' },
  { name: 'Redis', category: 'Cache', description: 'In-memory caching and session state distribution', badge: 'In-Memory' },
  { name: 'Celery', category: 'Workers', description: 'Asynchronous task queue for AI response generation', badge: 'Tasks' },
  { name: 'WebSockets', category: 'Realtime', description: 'Persistent bidirectional communication pipe', badge: 'WS' },
  { name: 'Framer Motion', category: 'Animation', description: 'Hardware-accelerated fluid motion engine', badge: 'v12' },
  { name: 'Tailwind CSS', category: 'Styling', description: 'Design token driven utility styling architecture', badge: 'v4' },
  { name: 'TypeScript', category: 'Language', description: 'Strict end-to-end type safety and API contracts', badge: 'v5.7' },
] as const

export const SECURITY_POINTS: readonly SecurityPoint[] = [
  {
    title: '256-Bit Data Encryption',
    description: 'All journal entries, mood logs, and chat conversations are encrypted in transit and at rest.',
  },
  {
    title: 'JWT Token Security',
    description: 'Stateless JWT authentication with short-lived access tokens and automatic token rotation.',
  },
  {
    title: 'Strict Data Privacy',
    description: 'Your personal data is never sold, shared with third parties, or used for model advertising.',
  },
  {
    title: 'Audit Logging & Safety Controls',
    description: 'Realtime crisis severity detection triggers automated helpline recommendations without manual intervention.',
  },
] as const

export const FAQS: readonly FAQItem[] = [
  {
    question: 'What is the philosophy behind Kintsugi?',
    answer: 'Kintsugi is the traditional Japanese art of repairing broken pottery with gold lacquer. We apply this philosophy to mental wellness—viewing challenges not as flaws to hide, but as meaningful parts of your story that make you stronger and more resilient.',
  },
  {
    question: 'Is Kintsugi a replacement for medical therapy?',
    answer: 'No. Kintsugi is an emotional self-care and reflective tool designed for daily mindfulness and support. It is not a clinical diagnostic tool or a substitute for professional medical treatment or psychotherapy.',
  },
  {
    question: 'How is my private data protected?',
    answer: 'We enforce 256-bit SSL encryption for all data in transit and AES-256 encryption at rest. Your journal reflections and chat conversations are strictly confidential and accessible only by you.',
  },
  {
    question: 'How does the AI Companion work?',
    answer: 'Our AI companion uses fine-tuned language models guided by Cognitive Behavioral Therapy (CBT) and reflective active-listening principles. It provides compassionate, non-judgmental dialogue available 24/7.',
  },
  {
    question: 'What happens in a crisis or emergency?',
    answer: 'Kintsugi continuously monitors dialogue for distress cues. If severe distress is detected, the app automatically presents verified 24/7 national helplines and crisis contacts.',
  },
  {
    question: 'Can I use Kintsugi offline?',
    answer: 'Yes! Kintsugi includes robust local caching that allows you to complete daily check-ins and write journal entries even when internet access is unavailable. Changes automatically sync when reconnected.',
  },
  {
    question: 'Is Kintsugi free to start?',
    answer: 'Yes. Kintsugi offers full access to daily mood check-ins, journal writing, breathing exercises, and standard AI companion dialogue without requiring a credit card.',
  },
  {
    question: 'Which devices and browsers are supported?',
    answer: 'Kintsugi is built with responsive web architecture supporting all modern web browsers (Chrome, Safari, Firefox, Edge) across iOS, Android, macOS, Windows, and Linux.',
  },
] as const

export const TESTIMONIALS: readonly TestimonialItem[] = [
  {
    quote: 'Kintsugi transformed my evening routine. Tracking my mood and writing brief reflections feels deeply calming.',
    author: 'Elena R.',
    role: 'Product Designer',
    tag: 'Daily Practitioner',
  },
  {
    quote: 'The AI companion offers astonishingly empathetic responses. It gives me space to process feelings without judgment.',
    author: 'Marcus T.',
    role: 'Software Architect',
    tag: 'Active Member',
  },
  {
    quote: 'The gold repair seam visual metaphor is breathtaking. It genuinely changes how I view my personal setbacks.',
    author: 'Sarah L.',
    role: 'Wellness Educator',
    tag: 'Mindfulness Advocate',
  },
] as const

export const TRUSTED_PARTNERS = [
  'Stanford Behavioral Health',
  'Mindfulness Initiative',
  'Mental Health Alliance',
  'Open Wellness Collective',
] as const
