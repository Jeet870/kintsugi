import React from 'react'
import { HeroSection } from '@/features/onboarding/components/landing/HeroSection'
import { TrustedSection } from '@/features/onboarding/components/landing/TrustedSection'
import { FeaturesSection } from '@/features/onboarding/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/features/onboarding/components/landing/HowItWorksSection'
import { AISection } from '@/features/onboarding/components/landing/AISection'
import { MoodSection } from '@/features/onboarding/components/landing/MoodSection'
import { JournalSection } from '@/features/onboarding/components/landing/JournalSection'
import { MotivationSection } from '@/features/onboarding/components/landing/MotivationSection'
import { EmergencySection } from '@/features/onboarding/components/landing/EmergencySection'
import { TechnologySection } from '@/features/onboarding/components/landing/TechnologySection'
import { SecuritySection } from '@/features/onboarding/components/landing/SecuritySection'
import { TestimonialsSection } from '@/features/onboarding/components/landing/TestimonialsSection'
import { FAQSection } from '@/features/onboarding/components/landing/FAQSection'
import { CTASection } from '@/features/onboarding/components/landing/CTASection'

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AISection />
      <MoodSection />
      <JournalSection />
      <MotivationSection />
      <EmergencySection />
      <TechnologySection />
      <SecuritySection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}

export default WelcomeScreen
