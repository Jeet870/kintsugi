import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Home, Sparkles, Compass } from 'lucide-react'

import { AppLogo } from '@/components/AppLogo'
import { ROUTES } from '@/app/router/routes'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { Button } from '@/components/ui/button'
import { BackgroundEffects } from '@/components/background/BackgroundEffects'
import { GlassCard } from '@/components/ui/GlassCard'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const handleNav = (path: string, message: string) => {
    useLoadingStore.getState().show(message)
    navigate(path)
  }

  const handleGoBack = () => {
    useLoadingStore.getState().show('Returning to previous page...')
    navigate(-1)
  }

  return (
    <div className="w-full h-screen max-h-screen flex items-center justify-center p-4 bg-[#09090B] text-[#FAFAFA] relative overflow-hidden select-none">
      {/* ── Persisted Hexagon & Kintsugi Gold Line Background ── */}
      <BackgroundEffects />

      {/* ── Ambient Glowing Radial Sphere ── */}
      <motion.div
        className="absolute w-[650px] h-[650px] rounded-full bg-radial from-[#7C3AED]/25 via-[#D4AF37]/15 to-transparent blur-3xl pointer-events-none z-0"
        animate={
          isAnimated
            ? {
                scale: [1, 1.15, 0.95, 1],
                opacity: [0.4, 0.7, 0.4],
              }
            : undefined
        }
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── Main Animated 404 Glass Card ── */}
      <motion.div
        className="max-w-lg w-full relative z-10"
        initial={isAnimated ? { opacity: 0, y: 24, scale: 0.95 } : undefined}
        animate={isAnimated ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <GlassCard accentColor="gold" hoverEffect={false} className="p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          {/* Top Logo */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleNav(ROUTES.PUBLIC.HOME, 'Loading Kintsugi Home...')}
              className="focus:outline-none hover:opacity-90 transition-opacity"
            >
              <AppLogo size={42} showText={true} />
            </button>
          </div>

          {/* Floating 404 Gold Emblem */}
          <div className="relative py-2 flex flex-col items-center justify-center">
            {/* Pulsing Concentric Gold Halo Ring */}
            <motion.div
              className="absolute w-40 h-40 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 blur-sm pointer-events-none"
              animate={
                isAnimated
                  ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.8, 0.3],
                      rotate: [0, 180, 360],
                    }
                  : undefined
              }
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Giant 404 Text */}
            <motion.h1
              className="text-7xl sm:text-8xl font-extrabold tracking-tighter bg-gradient-to-r from-violet-400 via-[#F5D06F] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-2xl font-serif"
              animate={
                isAnimated
                  ? {
                      y: [-4, 4, -4],
                    }
                  : undefined
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              404
            </motion.h1>

            {/* Floating Compass / Search Badge */}
            <motion.div
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold shadow-inner"
              animate={
                isAnimated
                  ? {
                      scale: [1, 1.05, 1],
                    }
                  : undefined
              }
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Compass className="w-3.5 h-3.5 text-[#D4AF37] animate-spin-slow" />
              <span>Page Restored & Uncharted</span>
            </motion.div>
          </div>

          {/* Heading & Kintsugi Quote */}
          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-zinc-100 sm:text-2xl font-serif">
              Lost Along the Gold Seam
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              "Not all who wander are lost. In the art of Kintsugi, every detour holds the potential for renewed strength and beauty."
            </p>
          </div>

          {/* Interactive Action Buttons */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => handleNav(ROUTES.PUBLIC.HOME, 'Loading Kintsugi Home...')}
                className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-600/30 gap-2 border border-violet-400/20 text-xs sm:text-sm"
              >
                <Home className="w-4 h-4 text-violet-200" />
                <span>Return Home</span>
              </Button>

              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full h-11 border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg font-semibold gap-2 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Page</span>
              </Button>
            </div>

            <Button
              onClick={() => handleNav(ROUTES.PUBLIC.FEATURES, 'Loading Features Ecosystem...')}
              variant="ghost"
              className="w-full text-xs text-zinc-400 hover:text-violet-300 hover:bg-violet-950/30 rounded-lg gap-2 py-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Or Explore Kintsugi Platform Features</span>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
