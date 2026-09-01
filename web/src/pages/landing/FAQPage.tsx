import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { GlassCard } from '@/components/ui/GlassCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpCircle, ShieldCheck, Sparkles, AlertTriangle, Heart, Search, Lock, PhoneCall } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

interface CategorizedFAQ {
  category: string
  icon: React.ElementType
  badgeColor: string
  questions: { q: string; a: string }[]
}

export const FAQPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories: CategorizedFAQ[] = [
    {
      category: 'Privacy & Security Architecture',
      icon: ShieldCheck,
      badgeColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
      questions: [
        {
          q: 'How are my personal journal entries protected?',
          a: 'All journal entries and reflections are encrypted on the client device using AES-256 Fernet symmetric cryptography before being stored in our database. Not even server administrators can read your raw journal content.',
        },
        {
          q: 'Does Kintsugi sell or monetize my mental health data?',
          a: 'Never. We have a strict zero-monetization policy. We do not sell, rent, or trade your data to advertisers, data brokers, insurance companies, or third parties. We deploy zero cross-site ad-tracking scripts.',
        },
        {
          q: 'Can I export or permanently delete my data?',
          a: 'Yes. You retain 100% ownership of your data. You can download a complete JSON export of your journals and mood logs at any time from your settings. Clicking "Delete Account" permanently purges your data from production database indexes within 24 hours.',
        },
        {
          q: 'Where is my data stored and processed?',
          a: 'Our servers operate in secure, SOC-2 and ISO-27001 certified data centers with encrypted backups and database row-level security controls.',
        },
      ],
    },
    {
      category: 'AI Companion & CBT Methodology',
      icon: Sparkles,
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      questions: [
        {
          q: 'Is my chat conversation used to train public AI models?',
          a: 'No. Conversations with our AI companion are processed in memory via private, low-latency Mistral AI API endpoints. Your messages are never used to train or fine-tune public foundation AI models.',
        },
        {
          q: 'How does the AI companion support emotional reflection?',
          a: 'Our AI companion is engineered around Cognitive Behavioral Therapy (CBT) principles, active listening, and empathetic validation. It asks non-directive, reflective questions to help you process daily emotions without judgment or pressure.',
        },
        {
          q: 'Can the AI companion replace traditional human therapy?',
          a: 'No. Kintsugi is a supportive self-care companion, not a licensed therapist or clinical service. It is designed to complement—not replace—professional mental healthcare.',
        },
      ],
    },
    {
      category: 'Clinical Governance & Safety Boundaries',
      icon: AlertTriangle,
      badgeColor: 'text-red-400 border-red-500/30 bg-red-500/10',
      questions: [
        {
          q: 'What happens if I express thoughts of self-harm or acute distress?',
          a: 'Our real-time safety layer automatically detects high-risk distress indicators. The app immediately pauses standard AI conversation and presents verified 24/7 crisis hotline resources (such as 988 in the US/Canada or 741741 Crisis Text Line).',
        },
        {
          q: 'Does Kintsugi diagnose mental health conditions?',
          a: 'No. Kintsugi does not diagnose medical or psychiatric conditions such as Depression, PTSD, or Anxiety. Always consult a licensed physician or psychiatrist for clinical evaluation.',
        },
      ],
    },
    {
      category: 'Daily Wellness & Features',
      icon: Heart,
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      questions: [
        {
          q: 'How often should I check in with Kintsugi?',
          a: 'Kintsugi is designed for gentle, non-pressured use. Most users check in once or twice daily for 2 to 3 minutes to log their mood, record a journal note, or complete a 4-7-8 breathing session.',
        },
        {
          q: 'What exercises are included in the Wellness suite?',
          a: 'The platform includes interactive 4-7-8 deep breathing cycles, 5-4-3-2-1 sensory grounding tools, mood trend analytics, daily curated motivational quotes, and self-care milestone streaks.',
        },
      ],
    },
  ]

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((cat) => cat.questions.length > 0)

  return (
    <>
      <PageHero
        badgeText="Knowledge Base & Guidance"
        title="Frequently Asked"
        highlightedTitle="Questions"
        subtitle="Explore detailed answers regarding privacy guarantees, AES-256 encryption, AI companion boundaries, and clinical safety protocols."
        breadcrumbItems={[{ label: 'FAQ' }]}
        icon={HelpCircle}
      />

      <PageContainer className="space-y-10 max-w-5xl mx-auto text-left">
        {/* Interactive Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions (e.g. encryption, privacy, AI, 988)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl text-sm focus:border-violet-500 focus:ring-violet-500/20 shadow-lg"
          />
        </div>

        {/* Categorized FAQ Accordion List */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, catIdx) => {
              const CategoryIcon = cat.icon
              return (
                <GlassCard key={catIdx} accentColor="purple" className="p-6 sm:p-8 space-y-6 rounded-2xl border-border bg-card text-card-foreground">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                      <CategoryIcon className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground font-serif">
                        {cat.category}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {cat.questions.length} question{cat.questions.length > 1 ? 's' : ''} in this category
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {cat.questions.map((faq, qIdx) => (
                      <AccordionItem
                        key={qIdx}
                        value={`item-${catIdx}-${qIdx}`}
                        className="border border-border rounded-xl bg-muted/30 px-5 py-1 transition-all hover:border-amber-500/40"
                      >
                        <AccordionTrigger className="text-sm font-semibold text-card-foreground hover:text-amber-500 text-left py-3">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4 pt-1">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </GlassCard>
              )
            })
          ) : (
            <GlassCard accentColor="gold" className="p-8 text-center space-y-3 rounded-2xl border-border bg-card text-card-foreground">
              <p className="text-base font-semibold text-card-foreground">No matching questions found</p>
              <p className="text-xs text-muted-foreground">Try searching for keywords like "privacy", "AI", "encryption", or "delete".</p>
            </GlassCard>
          )}
        </div>

        {/* Direct Help Action Banner */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 rounded-2xl text-card-foreground">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold text-card-foreground font-serif">
                Have a question not answered here?
              </h4>
              <p className="text-xs text-muted-foreground">
                Explore our full clinical safety disclaimers or view verified crisis support helplines.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => navigate(ROUTES.PUBLIC.SAFETY)}
                variant="outline"
                className="text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
              >
                <Lock className="w-3.5 h-3.5 text-violet-500" />
                <span>Safety Architecture</span>
              </Button>

              <Button
                onClick={() => navigate(ROUTES.PUBLIC.CRISIS_SUPPORT)}
                className="text-xs gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
                <span>Crisis Support</span>
              </Button>
            </div>
          </div>
        </GlassCard>
      </PageContainer>
    </>
  )
}

export default FAQPage
