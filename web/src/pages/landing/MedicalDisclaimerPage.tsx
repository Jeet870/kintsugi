import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GlassCard } from '@/components/ui/GlassCard'
import { WarningBanner } from '@/components/ui/WarningBanner'
import { Button } from '@/components/ui/button'
import { AlertTriangle, LifeBuoy, Shield, PhoneCall, HelpCircle } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const MedicalDisclaimerPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageHero
        badgeText="Clinical Boundaries & Governance"
        title="Medical Disclaimer &"
        highlightedTitle="Scope of Service"
        subtitle="Clear, transparent guidance defining the boundaries between Kintsugi’s reflective companion platform and licensed medical healthcare."
        breadcrumbItems={[{ label: 'Medical Disclaimer' }]}
        icon={AlertTriangle}
      />

      <PageContainer className="space-y-8 max-w-5xl mx-auto text-left">
        {/* Prominent High-Priority Warning Banner */}
        <WarningBanner
          title="NOT A MEDICAL DEVICE OR EMERGENCY CRISIS SERVICE"
          description="Kintsugi is an AI-assisted self-reflection and emotional tracking application. It is NOT a medical device, does NOT diagnose mental health conditions, and CANNOT provide emergency medical intervention or licensed clinical psychotherapy."
        />

        {/* Immediate Crisis Hotline Banner */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 border-amber-500/40 bg-card text-card-foreground shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <LifeBuoy className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>Immediate Emergency & Crisis Contacts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground font-serif">
            If You Are in Acute Crisis or Distress
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
            If you are contemplating self-harm, suicide, or experiencing a severe psychiatric or medical emergency, please do <strong>not</strong> rely on Kintsugi. Contact immediate professional support:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-muted/40 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">US Suicide & Crisis Lifeline</span>
              <p className="text-xl font-extrabold text-foreground font-mono">Call or Text 988</p>
              <span className="text-[10px] text-muted-foreground">Available 24/7 · Free & Confidential</span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Crisis Text Line</span>
              <p className="text-xl font-extrabold text-foreground font-mono">Text HOME to 741741</p>
              <span className="text-[10px] text-muted-foreground">Connect with a crisis counselor</span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">General Emergency</span>
              <p className="text-xl font-extrabold text-foreground font-mono">Call 911 or Local ER</p>
              <span className="text-[10px] text-muted-foreground">Or contact local emergency service</span>
            </div>
          </div>
        </GlassCard>

        {/* Section 1: Non-Clinical Nature of Platform */}
        <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 1"
            title="Non-Clinical Self-Care & Companion Boundaries"
            subtitle="Understanding what Kintsugi is and what it is not"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kintsugi is designed solely as a digital supportive space for personal reflection, daily mood logging, guided breathing exercises, and self-directed mindfulness.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h4 className="font-bold text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> WHAT KINTSUGI IS
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>An empathetic, non-judgmental conversational sounding board</li>
                  <li>A private, encrypted personal daily journaling tool</li>
                  <li>A gentle tracker for observing emotional trends over time</li>
                  <li>A resource directory linking to professional helplines</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <h4 className="font-bold text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> WHAT KINTSUGI IS NOT
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                  <li>Not a licensed psychiatrist, therapist, or counselor</li>
                  <li>Not a clinical diagnostic tool for DSM-5 / ICD-11 conditions</li>
                  <li>Not a prescription provider or medical advice engine</li>
                  <li>Not a real-time human crisis monitoring hotline</li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Absence of Doctor-Patient Relationship */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 2"
            title="Absence of Therapeutic & Doctor-Patient Alliance"
            subtitle="No professional clinical duties or therapeutic obligations"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Interacting with Kintsugi’s AI companion, completing mood surveys, or using journal features does <strong>NOT</strong> create a doctor-patient, therapist-client, or clinical health relationship between you and Kintsugi or its developers.
            </p>
            <p>
              The responses provided by our AI models are generated algorithmically for reflective dialogue and psychoeducational exploration. They must never be interpreted as formal clinical advice, medical diagnoses, treatment plans, or therapeutic directives.
            </p>
          </div>
        </GlassCard>

        {/* Section 3: Diagnostic Disclaimer */}
        <GlassCard accentColor="purple" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 3"
            title="No Psychiatric Diagnostics or Clinical Assessment"
            subtitle="Kintsugi cannot evaluate or diagnose medical conditions"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kintsugi does not possess clinical assessment tools to diagnose mental health disorders including Major Depressive Disorder (MDD), Generalized Anxiety Disorder (GAD), Post-Traumatic Stress Disorder (PTSD), Bipolar Disorder, or Eating Disorders.
            </p>
            <p>
              If you suspect you may be experiencing symptoms of a mental health condition, we strongly encourage you to consult a licensed psychiatrist, clinical psychologist, or primary care physician.
            </p>
          </div>
        </GlassCard>

        {/* Section 4: Safe Complementary Usage */}
        <GlassCard accentColor="gold" className="p-6 sm:p-8 space-y-4 rounded-2xl border-border bg-card text-card-foreground">
          <SectionTitle
            category="Section 4"
            title="Complementary Self-Care & Professional Collaboration"
            subtitle="How to use Kintsugi safely alongside professional therapy"
          />
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kintsugi can serve as a helpful complementary tool for tracking moods and journaling between therapy sessions. You are welcome to share your exported mood insights or reflection logs with your licensed mental health professional to support your ongoing care.
            </p>
            <p>
              Never disregard professional medical advice or delay seeking care because of content generated by or logged within the Kintsugi platform.
            </p>
          </div>
        </GlassCard>

        {/* Action Button Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(ROUTES.PUBLIC.CRISIS_SUPPORT)}
            className="w-full sm:w-auto text-xs gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
          >
            <PhoneCall className="w-4 h-4 text-slate-950" />
            <span>View Full Helpline Directory</span>
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => navigate(ROUTES.PUBLIC.SAFETY)}
              variant="outline"
              className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Safety Policies</span>
            </Button>

            <Button
              onClick={() => navigate(ROUTES.PUBLIC.FAQ)}
              variant="outline"
              className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
            >
              <HelpCircle className="w-4 h-4 text-violet-500" />
              <span>FAQ</span>
            </Button>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

export default MedicalDisclaimerPage
