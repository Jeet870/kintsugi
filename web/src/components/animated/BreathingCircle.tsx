import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function BreathingCircle() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')
  const [counter, setCounter] = useState(4)

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          if (phase === 'Inhale') {
            setPhase('Hold')
            return 7
          } else if (phase === 'Hold') {
            setPhase('Exhale')
            return 8
          } else {
            setPhase('Inhale')
            return 4
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase])

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <motion.div
          animate={{
            scale: phase === 'Inhale' ? 1.25 : phase === 'Hold' ? 1.25 : 0.85,
            opacity: phase === 'Hold' ? 0.9 : 0.6,
          }}
          transition={{
            duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 7 : 8,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7C3AED]/30 via-[#A855F7]/20 to-[#F59E0B]/30 border-2 border-[#7C3AED]/50 shadow-xl shadow-[#7C3AED]/20"
        />

        <div className="relative z-10 text-center space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#A855F7]">{phase}</p>
          <p className="text-2xl font-extrabold text-[#FAFAFA]">{counter}s</p>
        </div>
      </div>
      <p className="text-xs text-[#A1A1AA] text-center max-w-xs">
        4-7-8 Rhythm: Inhale 4s, Hold 7s, Exhale 8s to calm your nervous system.
      </p>
    </div>
  )
}
