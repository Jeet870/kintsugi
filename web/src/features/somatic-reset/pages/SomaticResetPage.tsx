import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Hand, Volume2, Wind, Heart, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface GroundingStep {
  step: number
  count: number
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  prompt: string
}

const STEPS: GroundingStep[] = [
  {
    step: 1,
    count: 5,
    title: '5 Things You Can SEE',
    subtitle: 'Look around your physical room right now',
    icon: <Eye className="w-6 h-6 text-[#D4AF37]" />,
    color: '#D4AF37',
    prompt: 'Name 5 distinct objects in your visual field (e.g. lamp, desk corner, window, cup, plant):',
  },
  {
    step: 2,
    count: 4,
    title: '4 Things You Can TOUCH',
    subtitle: 'Feel the tactile texture of your surroundings',
    icon: <Hand className="w-6 h-6 text-[#8B5CF6]" />,
    color: '#8B5CF6',
    prompt: 'Notice 4 physical textures (e.g. soft fabric of your shirt, solid desk surface, cool air on skin):',
  },
  {
    step: 3,
    count: 3,
    title: '3 Things You Can HEAR',
    subtitle: 'Listen closely to subtle ambient sounds',
    icon: <Volume2 className="w-6 h-6 text-[#2DD4BF]" />,
    color: '#2DD4BF',
    prompt: 'Listen for 3 ambient sounds (e.g. computer fan, distant birds, your own calm breathing):',
  },
  {
    step: 4,
    count: 2,
    title: '2 Things You Can SMELL',
    subtitle: 'Inhale slowly through your nose',
    icon: <Wind className="w-6 h-6 text-[#F2CA50]" />,
    color: '#F2CA50',
    prompt: 'Notice 2 smells around you (e.g. fresh coffee, clean air, essential oil):',
  },
  {
    step: 5,
    count: 1,
    title: '1 Thing You Can TASTE & Deep Breath',
    subtitle: 'Complete the somatic reset with 1 full breath',
    icon: <Heart className="w-6 h-6 text-emerald-400" />,
    color: '#10B981',
    prompt: 'Notice 1 taste or focus on a deep, soothing 4-second exhale:',
  },
]

export function SomaticResetPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const step = STEPS[currentStepIndex]

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleReset = () => {
    setCurrentStepIndex(0)
    setIsCompleted(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[#D4AF37]/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs px-3 py-1">
                Somatic Grounding Protocol
              </Badge>
              <Badge className="bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#8B5CF6] font-mono text-xs px-3 py-1">
                Immediate Panic & Anxiety De-escalation
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              5-4-3-2-1 Somatic Reset Tool
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
              A clinically proven 5-step sensory grounding method to immediately pull your brain out of panic loops and anchor your consciousness into the present moment.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((s, idx) => (
          <div
            key={s.step}
            onClick={() => setCurrentStepIndex(idx)}
            className={`cursor-pointer transition-all flex items-center justify-center ${
              idx === currentStepIndex
                ? 'w-10 h-10 rounded-full bg-[#D4AF37] text-[#0B0D17] font-bold text-sm shadow-[0_0_15px_#D4AF37]'
                : idx < currentStepIndex
                ? 'w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37]'
                : 'w-8 h-8 rounded-full bg-card border border-border text-muted-foreground'
            }`}
          >
            {idx < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : s.count}
          </div>
        ))}
      </div>

      {/* Main Step Card */}
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="glass-panel p-8 rounded-2xl border border-[#D4AF37]/30 space-y-6 text-center max-w-2xl mx-auto relative overflow-hidden">
              {/* Glowing Pulse Visualizer Circle */}
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                  style={{ backgroundColor: step.color }}
                />
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg border"
                  style={{ backgroundColor: `${step.color}20`, borderColor: `${step.color}60` }}
                >
                  {step.icon}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-foreground">{step.title}</h2>
                <p className="text-sm text-muted-foreground font-mono">{step.subtitle}</p>
              </div>

              <div className="bg-background/60 p-4 rounded-xl border border-border text-left">
                <p className="text-xs font-semibold text-[#D4AF37] mb-2">{step.prompt}</p>
                <div className="space-y-2">
                  {Array.from({ length: step.count }).map((_, i) => (
                    <Input
                      key={i}
                      placeholder={`Item ${i + 1}...`}
                      className="bg-card/70 border-border focus:border-[#D4AF37] text-sm"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  className="cursor-pointer"
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0B0D17] font-bold px-8 py-2.5 rounded-xl cursor-pointer"
                >
                  {currentStepIndex === STEPS.length - 1 ? 'Complete Reset' : 'Next Step'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-panel p-8 rounded-2xl border border-emerald-500/40 text-center max-w-2xl mx-auto space-y-6 bg-emerald-500/10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-foreground">Somatic Reset Completed</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Your nervous system has successfully completed the 5-4-3-2-1 sensory grounding protocol. Take a moment to feel your feet grounded firmly on the floor.
                </p>
              </div>

              <Button
                onClick={handleReset}
                className="bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0B0D17] font-bold px-8 py-3 rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Repeat Grounding Exercise</span>
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SomaticResetPage
