import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Lock, EyeOff, Server, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const SafetyPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageHero
        badgeText="Safety & Security Architecture"
        title="Privacy & Data Protection"
        highlightedTitle="Guaranteed by Design"
        subtitle="Discover the zero-trust security architecture, client-side encryption algorithms, and privacy controls protecting your personal wellness data."
        breadcrumbItems={[{ label: 'Safety Architecture' }]}
        icon={ShieldCheck}
      />

      <PageContainer className="space-y-12 max-w-5xl mx-auto text-left">
        {/* Core Pillars Grid */}
        <section className="space-y-8">
          <SectionTitle
            category="Security Pillars"
            title="Your Data Belongs Exclusively to You"
            subtitle="Built on zero-trust cryptography and transparent compliance standards."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400">
                <Lock className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">AES-256 Fernet Encryption</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All personal journal entries and reflection logs are encrypted client-side using Fernet symmetric AES-256 keys prior to server transmission. Raw text is never exposed in server database logs.
              </p>
            </GlassCard>

            <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <EyeOff className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Zero Data Monetization</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We deploy zero advertising tracking scripts, cross-site trackers, or data brokers. Your emotional check-ins are never profiled, commercialized, or shared with third parties.
              </p>
            </GlassCard>

            <GlassCard accentColor="emerald" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <Server className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Isolated Microservice Architecture</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                User authentication credentials and encrypted content records reside in strictly separated microservices with dedicated access control rules and audit trails.
              </p>
            </GlassCard>

            <GlassCard accentColor="rose" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              </div>
              <h4 className="text-xl font-bold text-card-foreground font-serif">Real-Time Crisis Escalation Layer</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Automated sentiment monitoring actively detects acute distress indicators, pausing AI chat to surface instant connection to 24/7 national helplines (988).
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Security Specifications Section */}
        <section className="space-y-6">
          <SectionTitle
            category="Technical Controls"
            title="Enterprise Security Specifications"
            subtitle="How Kintsugi protects platform integrity and user confidentiality."
          />

          <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-6 rounded-2xl border-border bg-card text-card-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-card-foreground">TLS 1.3 Transport Security</h5>
                  <p className="text-xs text-muted-foreground">All network traffic encrypted with high-cipher TLS 1.3 protocol.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-card-foreground">JWT Token Expiration</h5>
                  <p className="text-xs text-muted-foreground">Short-lived access tokens with secure refresh handling.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-card-foreground">GDPR 1-Click Erasure</h5>
                  <p className="text-xs text-muted-foreground">Instant user account termination and data purge upon request.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-card-foreground">FastAPI Rate Limiting</h5>
                  <p className="text-xs text-muted-foreground">Middleware rate-limiting to prevent brute force credential attacks.</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Action Button Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(ROUTES.PUBLIC.PRIVACY_POLICY)}
            variant="outline"
            className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Read Full Privacy Policy</span>
          </Button>

          <Button
            onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            className="w-full sm:w-auto text-xs gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
          >
            <span>Create Secure Account</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </PageContainer>
    </>
  )
}

export default SafetyPage
