import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { AboutContent } from '@/features/about/components/AboutContent'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, Shield, ArrowRight, BookOpen } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const AboutPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageHero
        badgeText="Our Story & Philosophy"
        title="Embracing Life's Repairs"
        highlightedTitle="With Care & Gold"
        subtitle="Discover the Japanese philosophy behind Kintsugi and our mission to build a safe, private emotional companion for human resilience."
        breadcrumbItems={[{ label: 'About Kintsugi' }]}
        icon={Sparkles}
      />

      <PageContainer className="space-y-12 max-w-5xl mx-auto text-left">
        {/* Main Philosophy Content Component */}
        <AboutContent />

        {/* Platform Values Cards */}
        <section className="space-y-6">
          <SectionTitle
            category="Guiding Pillars"
            title="Our Core Platform Values"
            subtitle="The fundamental commitments guiding how we design and build Kintsugi."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard accentColor="gold" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <h4 className="text-base font-bold text-card-foreground font-serif">Honor Resilience</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We believe struggle is not a flaw to hide. Every repair in your life story adds character, beauty, and strength.
              </p>
            </GlassCard>

            <GlassCard accentColor="purple" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                <Shield className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <h4 className="text-base font-bold text-card-foreground font-serif">Absolute Data Privacy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your thoughts belong to you alone. Client-side AES-256 encryption guarantees your journal entries remain confidential.
              </p>
            </GlassCard>

            <GlassCard accentColor="emerald" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <Heart className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-card-foreground font-serif">Empathetic Design</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zero judgment, zero high-pressure streak penalties. A calm, supportive digital environment designed for human warmth.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Action Button Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(ROUTES.PUBLIC.HOW_IT_WORKS)}
            variant="outline"
            className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
          >
            <BookOpen className="w-4 h-4 text-violet-500" />
            <span>See How It Works</span>
          </Button>

          <Button
            onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            className="w-full sm:w-auto text-xs gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Button>
        </div>
      </PageContainer>
    </>
  )
}

export default AboutPage
