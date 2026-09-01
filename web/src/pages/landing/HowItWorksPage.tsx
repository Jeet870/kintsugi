import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { AnimatedTimeline, type TimelineStep } from '@/components/ui/AnimatedTimeline'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { Layers, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate()

  const steps: TimelineStep[] = [
    {
      step: '01',
      title: 'Intentional Daily Check-In',
      subtitle: 'Phase 1: Input & Selection',
      description: 'Select your mood from 6 canonical categories (Great, Good, Neutral, Sad, Anxious, Overwhelmed) and add optional reflective notes in a calm, non-judgmental space.',
    },
    {
      step: '02',
      title: 'AES-256 Client-Side Encryption',
      subtitle: 'Phase 2: Zero-Trust Security',
      description: 'Your journal text is encrypted locally on your browser device using AES-256 Fernet keys before transmission. Your raw text is unreadable to network sniffers or database admins.',
    },
    {
      step: '03',
      title: 'Asynchronous AI Processing & CBT Validation',
      subtitle: 'Phase 3: Asynchronous Workers',
      description: 'FastAPI microservices and Celery background workers process your entry, calculating streak velocity and generating supportive, CBT-informed empathetic feedback.',
    },
    {
      step: '04',
      title: 'Real-Time WebSocket Cache Patching',
      subtitle: 'Phase 4: Zero-Latency Delivery',
      description: 'Updates flow directly over persistent WebSocket channels, surgically patching your local TanStack Query cache without disruptive page reloads.',
    },
    {
      step: '05',
      title: 'Long-Term Emotional Restoration & Gold Joinery',
      subtitle: 'Phase 5: Growth & Resilience',
      description: 'Track your emotional trajectory over days, weeks, and months. Kintsugi illuminates your growth—celebrating every repair as proof of your strength.',
    },
  ]

  return (
    <>
      <PageHero
        badgeText="Platform Architecture & Workflow"
        title="How Kintsugi Restores"
        highlightedTitle="Emotional Well-Being"
        subtitle="A transparent, step-by-step breakdown of how daily check-ins, AES-256 encryption, asynchronous AI workers, and real-time WebSockets work in harmony."
        breadcrumbItems={[{ label: 'How It Works' }]}
        icon={Layers}
      />

      <PageContainer className="space-y-12 max-w-5xl mx-auto text-left">
        {/* Timeline Section */}
        <section className="space-y-8">
          <SectionTitle
            category="The 5-Step Restorative Pipeline"
            title="Surgical Engineering Meets Gentle Care"
            subtitle="Designed for zero friction, complete privacy, and long-term emotional insight."
          />
          <AnimatedTimeline steps={steps} />
        </section>

        {/* Methodological Foundation Cards */}
        <section className="space-y-6">
          <SectionTitle
            category="Clinical & Methodological Principles"
            title="Grounded in Evidence-Based Practices"
            subtitle="How Kintsugi combines cognitive behavioral principles with mindfulness science."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard accentColor="purple" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                <Sparkles className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <h4 className="text-base font-bold text-card-foreground font-serif">Cognitive Reframing</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Encourages identifying cognitive distortions and reframing negative thought spirals with compassionate self-inquiry.
              </p>
            </GlassCard>

            <GlassCard accentColor="gold" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Heart className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <h4 className="text-base font-bold text-card-foreground font-serif">Non-Linear Growth</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Healing isn't a straight line. Kintsugi celebrates every log—whether a tough day or a 7-day streak—without pressure.
              </p>
            </GlassCard>

            <GlassCard accentColor="emerald" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-card-foreground font-serif">Zero-Trust Privacy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Client-side Fernet AES-256 encryption ensures your reflections remain strictly private and inaccessible to unauthorized parties.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* CTA Banner */}
        <GlassCard accentColor="purple" className="p-8 text-center space-y-4 border-violet-500/30 bg-violet-500/10 dark:bg-violet-950/20 rounded-2xl text-card-foreground">
          <h3 className="text-2xl font-bold text-card-foreground font-serif">
            Ready to begin your personal journey?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Experience a private, supportive space designed to illuminate your emotional growth with care and gold.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button
              onClick={() => navigate(ROUTES.AUTH.REGISTER)}
              className="h-11 px-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl gap-2 shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Button>
          </div>
        </GlassCard>
      </PageContainer>
    </>
  )
}

export default HowItWorksPage
