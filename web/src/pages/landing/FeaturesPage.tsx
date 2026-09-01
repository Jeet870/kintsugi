import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Heart,
  Wind,
  Gamepad2,
  Lock,
  Quote,
  Zap,
  ArrowRight,
  LifeBuoy,
} from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

interface FeatureItem {
  title: string
  description: string
  category: string
  badge: string
  icon: React.ElementType
  accentColor: 'purple' | 'gold' | 'rose' | 'emerald' | 'blue'
}

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate()

  const features: FeatureItem[] = [
    {
      title: '24/7 AI Emotional Companion',
      description: 'Empathetic, non-judgmental reflection powered by low-latency Mistral AI. Tuned on Cognitive Behavioral Therapy (CBT) principles for active listening.',
      category: 'AI Companion',
      badge: 'CBT-Informed',
      icon: Sparkles,
      accentColor: 'purple',
    },
    {
      title: 'AES-256 Encrypted Private Journal',
      description: 'Your written entries are encrypted on your local device using AES-256 Fernet keys before sending to server databases. Absolute data sovereignty.',
      category: 'Privacy Vault',
      badge: 'Zero-Knowledge',
      icon: Lock,
      accentColor: 'gold',
    },
    {
      title: '6-Category Mood & Sentiment Analytics',
      description: 'Log your emotional state in seconds (Great, Good, Neutral, Sad, Anxious, Overwhelmed) and observe long-term trends and streak resilience over time.',
      category: 'Mood Tracking',
      badge: 'Analytics',
      icon: Heart,
      accentColor: 'rose',
    },
    {
      title: 'Guided 4-7-8 Breathing & Grounding',
      description: 'Interactive breathing timers and 5-4-3-2-1 sensory grounding modules to assist in de-escalating physical anxiety and panic responses.',
      category: 'Mindfulness',
      badge: 'Interactive',
      icon: Wind,
      accentColor: 'emerald',
    },
    {
      title: 'Daily Self-Care Motivation & Quotes',
      description: 'Curated daily affirmations and stoic wisdom to foster gentle self-compassion, resilience, and positive daily mindset alignment.',
      category: 'Daily Care',
      badge: 'Curated',
      icon: Quote,
      accentColor: 'gold',
    },
    {
      title: 'Calm Match Mindful Game',
      description: 'A gentle, low-pressure cognitive card-matching game designed to divert intrusive thoughts and provide pleasant focus breaks.',
      category: 'Cognitive Relief',
      badge: 'Mindful',
      icon: Gamepad2,
      accentColor: 'blue',
    },
    {
      title: 'Real-Time WebSocket Cache Bus',
      description: 'Updates patch your local TanStack Query state instantly over WebSocket channels without network latency or page refreshes.',
      category: 'Real-Time Sync',
      badge: 'FastAPI Engine',
      icon: Zap,
      accentColor: 'blue',
    },
    {
      title: 'Emergency Helpline Integration',
      description: 'Automated high-risk sentiment safety net that instantly presents verified 24/7 national helpline contacts (988 US/CA, Samaritans UK).',
      category: 'Clinical Safety',
      badge: '24/7 Access',
      icon: LifeBuoy,
      accentColor: 'rose',
    },
  ]

  return (
    <>
      <PageHero
        badgeText="Comprehensive Feature Suite"
        title="Everything You Need for"
        highlightedTitle="Emotional Restoration"
        subtitle="Explore Kintsugi's full suite of privacy-first emotional companion tools, encrypted journaling, CBT AI reflection, and guided mindfulness."
        breadcrumbItems={[{ label: 'Features' }]}
        icon={Sparkles}
      />

      <PageContainer className="space-y-12 max-w-6xl mx-auto text-left">
        {/* Main Features Grid */}
        <section className="space-y-8">
          <SectionTitle
            category="Platform Capabilities"
            title="Engineered for Care, Built for Privacy"
            subtitle="Explore each component designed to support your daily emotional journey."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <GlassCard key={idx} accentColor={feature.accentColor} className="p-6 space-y-4 rounded-2xl border-border bg-card text-card-foreground hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                      <Icon className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{feature.category}</span>
                    <h4 className="text-base font-bold text-card-foreground font-serif">{feature.title}</h4>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </GlassCard>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <GlassCard accentColor="purple" className="p-8 text-center space-y-4 border-violet-500/30 bg-violet-500/10 dark:bg-violet-950/20 rounded-2xl text-card-foreground">
          <h3 className="text-2xl font-bold text-card-foreground font-serif">
            Experience the Kintsugi Difference
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands prioritizing private, reflective self-care. Create your free account today.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button
              onClick={() => navigate(ROUTES.AUTH.REGISTER)}
              className="h-11 px-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl gap-2 shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Button>
          </div>
        </GlassCard>
      </PageContainer>
    </>
  )
}

export default FeaturesPage
