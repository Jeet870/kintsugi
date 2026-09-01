import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { Shield, Lock, EyeOff, Database, Key, CheckCircle, FileText, Heart } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageHero
        badgeText="Data Governance & Trust"
        title="Kintsugi Platform"
        highlightedTitle="Privacy Policy"
        subtitle="Our transparent, zero-monetization policy guaranteeing client-side encryption and absolute ownership of your mental wellness data."
        breadcrumbItems={[{ label: 'Privacy Policy' }]}
        icon={Shield}
      />

      <PageContainer className="space-y-8 max-w-5xl mx-auto text-left">
        {/* Top Highlight Card */}
        <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 border-violet-500/30 bg-violet-500/10 dark:bg-violet-950/20 text-card-foreground">
          <div className="flex items-center gap-3 text-violet-600 dark:text-violet-300 font-semibold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 text-violet-500 dark:text-violet-300" />
            <span>Last Updated: July 24, 2026 · Version 3.1</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground font-serif">
            Our Core Privacy Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
            At Kintsugi, we believe emotional reflection requires absolute privacy and safety. We do <strong>not</strong> sell, rent, monetize, or trade your personal journal entries, mood records, or conversation history to third-party advertisers, data brokers, or clinical researchers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-300">
              <EyeOff className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Zero Ad Tracking</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5 text-xs text-violet-600 dark:text-violet-300">
              <Database className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0" />
              <span>No AI Model Retraining</span>
            </div>
          </div>
        </GlassCard>

        {/* Section 1: Information We Collect */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 1"
            title="Information We Collect"
            subtitle="The minimal technical data required to operate your account"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>We collect only the essential data necessary to deliver your personalized companion experience:</p>
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Account Identifiers
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your name, email address, and securely hashed password (bcrypt algorithm). We use these details strictly to authenticate your account and recover lost access.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" /> Encrypted Journal Entries & Mood Logs
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Journal titles, text entries, and emotional mood ratings. All written journal entries are encrypted client-side using Fernet symmetric AES-256 keys prior to server database insertion.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Technical Telemetry & Performance Data
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anonymized crash logs, app load times, and operational metrics used solely to diagnose server errors and maintain system uptime.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: AI Companion & Conversation Handling */}
        <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 2"
            title="AI Companion Data Processing & LLM Safety"
            subtitle="How AI conversational reflection is processed safely"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kintsugi's AI companion is powered by low-latency Mistral AI LLM endpoints optimized for empathetic reflection.
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <strong>No Model Retraining:</strong> Your chat messages and journal reflections are <strong>NEVER</strong> used to train public or commercial AI foundation models.
              </li>
              <li>
                <strong>Stateless API Calls:</strong> Messages sent to our AI endpoints are processed in memory and discarded by model infrastructure after generating responses.
              </li>
              <li>
                <strong>Encrypted Session Storage:</strong> Saved conversation history is linked exclusively to your user ID and protected by database row-level security.
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Section 3: Data Security & Storage Architecture */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 3"
            title="Data Security Architecture & Cryptography"
            subtitle="Industry-standard security controls protecting your data"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              We implement multi-layered cryptographic and physical security measures to safeguard your information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground">Encryption in Transit</h4>
                <p className="text-xs text-muted-foreground">
                  TLS 1.3 encryption across all client-to-server HTTP API communications.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground">Encryption at Rest</h4>
                <p className="text-xs text-muted-foreground">
                  AES-256 database storage encryption preventing raw unauthorized data extraction.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground">JWT Token Security</h4>
                <p className="text-xs text-muted-foreground">
                  Cryptographically signed JSON Web Tokens (JWT) for secure state authorization.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                <h4 className="font-semibold text-xs text-card-foreground">Rate Limiting & Protection</h4>
                <p className="text-xs text-muted-foreground">
                  FastAPI backend middleware rate limiting to block brute-force credential attacks.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 4: Data Retention & User Rights */}
        <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 4"
            title="Data Retention, Export & Deletion Rights"
            subtitle="You retain full control to export or permanently erase your data"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              In accordance with international privacy frameworks (including GDPR, CCPA, and HIPAA privacy alignment standards):
            </p>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>
                <strong>Data Portability & Export:</strong> You can export your full journal history and mood logs at any time in structured JSON format via the Privacy Settings panel.
              </li>
              <li>
                <strong>Permanent Deletion:</strong> Clicking "Delete Account" in your user settings permanently and irreversibly purges your profile, encrypted journals, and chat sessions from our production servers within 24 hours.
              </li>
              <li>
                <strong>No Permanent Backups:</strong> Deleted data is completely removed from database indexes without retaining ghost archives.
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Section 5: Cookies & Local Storage */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 5"
            title="Cookies & Browser Local Storage"
            subtitle="How we manage authentication tokens locally"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kintsugi uses browser `localStorage` solely to persist your authentication token (`kintsugi_auth_token`) and user preferences (such as light/dark theme state). We do <strong>not</strong> deploy advertising tracking pixels, cross-site tracking cookies, or Google Analytics marketing trackers.
            </p>
          </div>
        </GlassCard>

        {/* Bottom Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(ROUTES.PUBLIC.TERMS)}
            variant="outline"
            className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Read Terms of Service</span>
          </Button>

          <Button
            onClick={() => navigate(ROUTES.PUBLIC.CRISIS_SUPPORT)}
            className="w-full sm:w-auto text-xs gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
          >
            <Heart className="w-4 h-4 text-slate-950" />
            <span>Access Emergency & Crisis Support</span>
          </Button>
        </div>
      </PageContainer>
    </>
  )
}

export default PrivacyPolicyPage
