import { useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/app/layout/AppShell'

import { MoodTrackerPage } from '@/features/mood-tracker/pages/MoodTrackerPage'
import { AICompanionPage } from '@/features/ai-companion/pages/AICompanionPage'
import { JournalPage } from '@/features/journal/pages/JournalPage'
import { DailyMotivationPage } from '@/features/daily-motivation/pages/DailyMotivationPage'
import { EmergencyHelpPage } from '@/features/emergency-help/pages/EmergencyHelpPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { MindGamePage } from '@/features/mind-game/pages/MindGamePage'
import { BreathingExercisePage } from '@/features/breathing-exercise/pages/BreathingExercisePage'
import { AboutPage } from '@/features/about/pages/AboutPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { AchievementsPage } from '@/features/achievements/pages/AchievementsPage'

import { KintsugiVesselPage } from '@/features/vessel/pages/KintsugiVesselPage'
import { SoundscapePage } from '@/features/soundscape/pages/SoundscapePage'
import { BiometricScanPage } from '@/features/biometric/pages/BiometricScanPage'
import { SomaticResetPage } from '@/features/somatic-reset/pages/SomaticResetPage'

export function AppDashboard() {
  const location = useLocation()
  const { tab: rawParamTab } = useParams<{ tab?: string }>()

  const tab = useMemo(() => {
    const p = location.pathname.toLowerCase()
    if (p.includes('/app/vessel')) return 'vessel'
    if (p.includes('/app/soundscape')) return 'soundscape'
    if (p.includes('/app/biometric-scan')) return 'biometric-scan'
    if (p.includes('/app/somatic-reset')) return 'somatic-reset'
    if (p.includes('/app/chat')) return 'chat'
    if (p.includes('/app/journal') || p === '/journal') return 'journal'
    if (p.includes('/app/breathing')) return 'breathing'
    if (p.includes('/app/motivation')) return 'motivation'
    if (p.includes('/app/emergency')) return 'emergency'
    if (p.includes('/app/profile')) return 'profile'
    if (p.includes('/app/settings')) return 'settings'
    if (p.includes('/app/mind-game')) return 'mind-game'
    if (p.includes('/app/notifications')) return 'notifications'
    if (p.includes('/app/achievements')) return 'achievements'
    if (p.includes('/app/about') || p === '/about') return 'about'
    if (p.includes('/app/mood') || p === '/mood') return 'mood'
    return rawParamTab || 'mood'
  }, [location.pathname, rawParamTab])

  return (
    <AppShell currentTab={tab}>
      <div className={tab === 'chat' || tab === 'journal' ? 'h-full flex flex-col flex-1 overflow-hidden' : 'space-y-6'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className={tab === 'chat' || tab === 'journal' ? 'h-full flex flex-col flex-1 overflow-hidden' : ''}
          >
            {/* TAB 1: MOOD TRACKER */}
            {tab === 'mood' && <MoodTrackerPage />}

            {/* TAB 2: 3D KINTSUGI MIND RESTORATION VESSEL */}
            {tab === 'vessel' && <KintsugiVesselPage />}

            {/* TAB 3: SOLFEGGIO SOUNDSCAPE SANCTUARY */}
            {tab === 'soundscape' && <SoundscapePage />}

            {/* TAB 4: AI BIOMETRIC & STRESS SCANNER */}
            {tab === 'biometric-scan' && <BiometricScanPage />}

            {/* TAB 5: 5-4-3-2-1 SOMATIC RESET TOOL */}
            {tab === 'somatic-reset' && <SomaticResetPage />}

            {/* TAB 6: AI COMPANION CHAT */}
            {tab === 'chat' && <AICompanionPage />}

            {/* TAB 7: ENCRYPTED JOURNAL */}
            {tab === 'journal' && <JournalPage />}

            {/* TAB 8: GUIDED BREATHING EXERCISE */}
            {tab === 'breathing' && <BreathingExercisePage />}

            {/* TAB 9: DAILY MOTIVATION */}
            {tab === 'motivation' && <DailyMotivationPage />}

            {/* TAB 10: EMERGENCY HELP */}
            {tab === 'emergency' && <EmergencyHelpPage />}

            {/* TAB 11: PROFILE DASHBOARD */}
            {tab === 'profile' && <ProfilePage />}

            {/* TAB 12: ACCOUNT SETTINGS */}
            {tab === 'settings' && <SettingsPage />}

            {/* TAB 13: MINDFUL MEMORY MATCH */}
            {tab === 'mind-game' && <MindGamePage />}

            {/* TAB 14: ABOUT KINTSUGI */}
            {tab === 'about' && <AboutPage />}

            {/* TAB 15: NOTIFICATIONS CENTER */}
            {tab === 'notifications' && <NotificationsPage />}

            {/* TAB 16: ACHIEVEMENTS & MILESTONES */}
            {tab === 'achievements' && <AchievementsPage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
