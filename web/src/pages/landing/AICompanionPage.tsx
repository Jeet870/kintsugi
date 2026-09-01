import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { MessageSquare, ShieldCheck, HeartHandshake, Zap, Lock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const AICompanionPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageHero
        badgeText="Conversational AI Architecture"
        title="Empathetic & CBT-Informed"
        highlightedTitle="AI Companion"
        subtitle="Explore how Kintsugi's AI companion active-listens, provides non-judgmental validation, and enforces strict safety protocols."
        breadcrumbItems={[{ label: 'AI Companion' }]}
        icon={MessageSquare}
      />

      <PageContainer className="space-y-12 max-w-5xl mx-auto text-left">
        {/* Core Principles Section */}
        <section className="space-y-8">
          <SectionTitle
            category="Empathy Principles"
            title="Engineered for Active Listening & Validation"
            subtitle="Built on strict clinical safety protocols and ethical AI guidelines."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                <HeartHandshake className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Non-Directive CBT Reframing</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The AI does not diagnose, prescribe, or give clinical directives. Instead, it asks gentle, structured questions based on Cognitive Behavioral Therapy (CBT) to help you explore your thoughts and reframe cognitive distortions.
              </p>
            </GlassCard>

            <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Low-Latency Response Engine</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Powered by low-latency Mistral AI microservices, conversation responses stream seamlessly without long waiting delays or jarring context losses.
              </p>
            </GlassCard>

            <GlassCard accentColor="emerald" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <Lock className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Zero-Model Retraining Guarantee</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your messages are processed in stateless memory buffers and are <strong>NEVER</strong> used to train public or commercial AI models. Your personal reflections stay private.
              </p>
            </GlassCard>

            <GlassCard accentColor="rose" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <ShieldCheck className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Automated Crisis Escalation</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Integrated real-time sentiment analysis monitors input for self-harm or acute distress keywords, immediately pausing AI chat to surface official 24/7 crisis helpline contacts.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* AI Comparison Matrix */}
        <section className="space-y-6">
          <SectionTitle
            category="Architectural Safety"
            title="Kintsugi Companion vs. Standard Chatbots"
            subtitle="Why specialized emotional guardrails matter for wellness applications."
          />

          <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-1/3">Feature / Guardrail</th>
                    <th className="py-3.5 px-4 w-1/3 text-violet-600 dark:text-violet-300">Kintsugi AI Companion</th>
                    <th className="py-3.5 px-4 w-1/3 text-muted-foreground">Generic Consumer LLMs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-card-foreground">
                  <tr>
                    <td className="py-4 px-4 font-semibold text-card-foreground">Private Non-Retraining Policy</td>
                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>100% Guaranteed</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                        <span>Often trained on user data</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-card-foreground">Automated Crisis Detection</td>
                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>Instant Hotline Escalation</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                        <span>Inconsistent or absent</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-card-foreground">CBT Active Listening Tuning</td>
                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>Systemic Prompt Alignment</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                        <span>Generic conversational output</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-card-foreground">Client-Side Encryption Integration</td>
                    <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>AES-256 Fernet Keys</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                        <span>Server-side unencrypted logs</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </section>

        {/* CTA Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(ROUTES.PUBLIC.SAFETY)}
            variant="outline"
            className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Read Safety Architecture</span>
          </Button>

          <Button
            onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            className="w-full sm:w-auto text-xs gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer"
          >
            <span>Try AI Companion Free</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </PageContainer>
    </>
  )
}

export default AICompanionPage
