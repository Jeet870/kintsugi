import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { LifeBuoy, Heart, Shield, AlertTriangle } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

interface HelplineContact {
  region: string
  name: string
  contact: string
  description: string
  availability: string
}

export const CrisisSupportPage: React.FC = () => {
  const navigate = useNavigate()

  const helplines: HelplineContact[] = [
    {
      region: 'United States & Canada',
      name: '988 Suicide & Crisis Lifeline',
      contact: 'Call or Text 988',
      description: 'Free, confidential, 24/7 support for anyone in suicidal crisis or emotional distress.',
      availability: '24/7 · Toll-Free',
    },
    {
      region: 'United States & Canada',
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      description: 'Connect with a volunteer crisis counselor 24/7 over SMS message.',
      availability: '24/7 · SMS Text',
    },
    {
      region: 'United Kingdom',
      name: 'Samaritans UK',
      contact: 'Call 116 123',
      description: 'Confidential emotional support for anyone in the UK experiencing feelings of distress or despair.',
      availability: '24/7 · Toll-Free',
    },
    {
      region: 'Australia',
      name: 'Lifeline Australia',
      contact: 'Call 13 11 14',
      description: '24-hour crisis support and suicide prevention services in Australia.',
      availability: '24/7 · Phone',
    },
    {
      region: 'International & Europe',
      name: 'Befrienders Worldwide',
      contact: 'befrienders.org',
      description: 'Global network of emotional support centers operating across 32 countries.',
      availability: 'Global Directory',
    },
    {
      region: 'Veterans & Service Members',
      name: 'Veterans Crisis Line (US)',
      contact: 'Dial 988, Press 1',
      description: 'Specialized support for military veterans, service members, and their families.',
      availability: '24/7 · Confidential',
    },
  ]

  return (
    <>
      <PageHero
        badgeText="Immediate Assistance"
        title="24/7 Emergency &"
        highlightedTitle="Crisis Support Directory"
        subtitle="If you are experiencing acute distress, thoughts of self-harm, or a medical emergency, please reach out to licensed professional support immediately."
        breadcrumbItems={[{ label: 'Crisis Support' }]}
        icon={LifeBuoy}
      />

      <PageContainer className="space-y-12 max-w-5xl mx-auto text-left">
        {/* High-Priority Emergency Callout Card */}
        <GlassCard accentColor="rose" className="p-6 sm:p-8 space-y-6 border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/30 text-card-foreground rounded-2xl">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>IMMEDIATE DANGER NOTICE</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground font-serif">
              You Are Not Alone. Help Is Available Right Now.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans max-w-3xl">
              Kintsugi is an emotional companion, NOT an emergency medical service. If you are in immediate danger or facing a medical emergency, please call <strong>911</strong> or go to your nearest hospital emergency room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="tel:988"
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-center space-y-1 shadow-lg shadow-rose-600/30 transition-all block cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-rose-100/90">Call US/Canada Crisis Line</span>
              <p className="text-2xl font-mono tracking-tight text-white">Call 988</p>
            </a>

            <a
              href="sms:741741?body=HOME"
              className="p-4 rounded-2xl bg-card hover:bg-muted border border-rose-500/40 text-card-foreground font-bold text-center space-y-1 transition-all block cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300">Text Crisis Counselor</span>
              <p className="text-2xl font-mono tracking-tight text-amber-600 dark:text-amber-300">Text HOME to 741741</p>
            </a>
          </div>
        </GlassCard>

        {/* Global Helplines Directory */}
        <section className="space-y-6">
          <SectionTitle
            category="Directory"
            title="Verified Regional Crisis Helplines"
            subtitle="Confidential, free support services available 24 hours a day."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helplines.map((item, idx) => (
              <GlassCard key={idx} accentColor="gold" className="p-6 space-y-3 rounded-2xl border-border bg-card text-card-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {item.region}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{item.availability}</span>
                </div>
                <h4 className="text-base font-bold text-card-foreground font-serif">{item.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="pt-2">
                  <span className="text-sm font-extrabold text-foreground font-mono bg-muted/40 px-3 py-1.5 rounded-lg border border-border inline-block">
                    {item.contact}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Immediate Grounding Tools Link */}
        <GlassCard accentColor="emerald" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Self-Regulation"
            title="Looking for Immediate Sensory Grounding?"
            subtitle="Practice our guided 4-7-8 breathing cycles to help calm your nervous system."
          />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Grounding exercises can assist in lowering physical panic responses. If you feel overwhelmed, try placing one hand on your chest and inhaling slowly for 4 seconds, holding for 7, and exhaling for 8.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate(ROUTES.WELLNESS.BREATHING)}
              className="text-xs gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
            >
              <Heart className="w-4 h-4 text-white" />
              <span>Open Guided Breathing Tool</span>
            </Button>
            <Button
              onClick={() => navigate(ROUTES.PUBLIC.MEDICAL_DISCLAIMER)}
              variant="outline"
              className="text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
            >
              <Shield className="w-4 h-4 text-violet-500" />
              <span>Read Medical Disclaimer</span>
            </Button>
          </div>
        </GlassCard>
      </PageContainer>
    </>
  )
}

export default CrisisSupportPage
