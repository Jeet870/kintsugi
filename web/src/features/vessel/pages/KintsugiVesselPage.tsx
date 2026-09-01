import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Hammer, ShieldCheck, Award, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface CrackNode {
  id: string
  label: string
  severity: 'low' | 'medium' | 'high'
  x: number
  y: number
  repaired: boolean
}

export function KintsugiVesselPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [resilienceScore, setResilienceScore] = useState(78)
  const [repairedCount, setRepairedCount] = useState(2)
  const [isRepairing, setIsRepairing] = useState(false)
  const [goldPoured, setGoldPoured] = useState(0)

  const [cracks, setCracks] = useState<CrackNode[]>([
    { id: '1', label: 'Work Overwhelm & Fatigue', severity: 'high', x: 0.35, y: 0.4, repaired: true },
    { id: '2', label: 'Imposter Syndrome', severity: 'medium', x: 0.65, y: 0.35, repaired: true },
    { id: '3', label: 'Sleep Disruption Crack', severity: 'high', x: 0.5, y: 0.58, repaired: false },
    { id: '4', label: 'Anxiety Tension Knot', severity: 'low', x: 0.28, y: 0.65, repaired: false },
    { id: '5', label: 'Emotional Strain Scar', severity: 'medium', x: 0.72, y: 0.62, repaired: false },
  ])

  // Canvas 3D Rotating Kintsugi Bowl Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let angle = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2 + 10
      const radius = 130

      // Ambient radial glow behind vessel
      const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220)
      bgGlow.addColorStop(0, 'rgba(212, 175, 55, 0.18)')
      bgGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)')
      bgGlow.addColorStop(1, 'rgba(11, 13, 23, 0)')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw Obsidian Metallic Vessel Body
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, radius, radius * 0.7, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(17, 19, 29, 0.95)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.restore()

      // Rotating Gold Veins (Kintsugi Scars)
      angle += 0.008
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3 + angle
        const vx = cx + Math.cos(theta) * (radius * 0.75)
        const vy = cy + Math.sin(theta) * (radius * 0.45)

        if (i === 0) ctx.moveTo(vx, vy)
        else ctx.bezierCurveTo(cx, cy, vx - 20, vy + 20, vx, vy)
      }
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)'
      ctx.lineWidth = 4
      ctx.shadowColor = '#D4AF37'
      ctx.shadowBlur = 15
      ctx.stroke()
      ctx.restore()

      // Particle stars
      for (let p = 0; p < 25; p++) {
        const px = (cx + Math.cos(angle * 2 + p * 0.7) * (radius * 1.3)) % canvas.width
        const py = (cy + Math.sin(angle * 1.5 + p * 0.5) * (radius * 0.9)) % canvas.height
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = p % 2 === 0 ? '#D4AF37' : '#8B5CF6'
        ctx.globalAlpha = 0.5 + Math.sin(angle * 3 + p) * 0.5
        ctx.fill()
      }

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationId)
  }, [cracks])

  const handleRepairNode = (node: CrackNode) => {
    if (node.repaired || isRepairing) return
    setIsRepairing(true)

    setTimeout(() => {
      setCracks((prev) =>
        prev.map((c) => (c.id === node.id ? { ...c, repaired: true } : c))
      )
      setResilienceScore((prev) => Math.min(100, prev + 8))
      setRepairedCount((prev) => prev + 1)
      setGoldPoured((prev) => prev + 150)
      setIsRepairing(false)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[#D4AF37]/30">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs px-3 py-1">
                3D Interactive Mind Sanctuary
              </Badge>
              <Badge className="bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#8B5CF6] font-mono text-xs px-3 py-1">
                Kintsugi Healing Engine
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Mind Restoration Vessel
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
              "Imperfection is not a flaw—it is your strength filled with liquid gold." Click on emotional stressors to mend them into permanent golden resilience.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-background/60 p-4 rounded-xl border border-[#D4AF37]/30 shadow-inner">
            <div className="text-center px-3 border-r border-border">
              <div className="text-2xl font-mono font-bold text-[#D4AF37]">{resilienceScore}%</div>
              <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Resilience Index</div>
            </div>
            <div className="text-center px-3 border-r border-border">
              <div className="text-2xl font-mono font-bold text-[#2DD4BF]">{repairedCount}/{cracks.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Golden Seams</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-mono font-bold text-[#8B5CF6]">{goldPoured}ml</div>
              <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Gold Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Vessel Viewport & Node Repair Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Canvas Vessel Viewport */}
        <Card className="lg:col-span-7 glass-panel p-6 rounded-2xl relative flex flex-col items-center justify-center min-h-[460px] border border-[#D4AF37]/25 overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-spin" />
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
              Live Golden Vessel Simulation
            </span>
          </div>

          {/* Interactive 3D Canvas */}
          <canvas
            ref={canvasRef}
            width={480}
            height={340}
            className="w-full max-w-[480px] h-[340px] rounded-xl cursor-grab active:cursor-grabbing"
          />

          {/* Floating Stressor Node Targets over Vessel */}
          <div className="w-full max-w-[480px] h-[340px] absolute inset-x-0 top-16 mx-auto pointer-events-none">
            {cracks.map((node) => (
              <div
                key={node.id}
                style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRepairNode(node)}
                  disabled={node.repaired || isRepairing}
                  className={`relative p-2 rounded-full border transition-all ${
                    node.repaired
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_#D4AF37]'
                      : 'bg-red-500/20 border-red-500/60 text-red-400 animate-pulse hover:bg-red-500/30'
                  }`}
                  title={node.repaired ? `${node.label} (Repaired)` : `Click to Repair ${node.label}`}
                >
                  {node.repaired ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              Tap any pulsating red stress node on the vessel to pour 24K Liquid Gold and seal the emotional fracture.
            </p>
          </div>
        </Card>

        {/* Right Column: Stressor Node Manager & Healing Log */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/25 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Hammer className="w-5 h-5 text-[#D4AF37]" />
                <span>Emotional Stressor Fractures</span>
              </h2>
              <Badge variant="outline" className="text-[11px] font-mono text-[#D4AF37] border-[#D4AF37]/40">
                {cracks.filter((c) => !c.repaired).length} Active Fractures
              </Badge>
            </div>

            <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
              {cracks.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    c.repaired
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-foreground'
                      : 'bg-card/50 border-border hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        c.repaired
                          ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]'
                          : c.severity === 'high'
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-semibold">{c.label}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {c.repaired ? 'Sealed with 24K Gold (+8 Resilience)' : `Severity: ${c.severity.toUpperCase()}`}
                      </div>
                    </div>
                  </div>

                  {c.repaired ? (
                    <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 font-mono text-[10px]">
                      HEALED
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRepairNode(c)}
                      disabled={isRepairing}
                      className="bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0B0D17] font-bold text-xs px-3 py-1 h-8 rounded-lg shadow-md cursor-pointer"
                    >
                      Pour Gold
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Kintsugi Wisdom Card */}
          <Card className="glass-panel p-5 rounded-2xl border border-[#8B5CF6]/30 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-[#8B5CF6] shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Kintsugi Philosophy</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  "When the Japanese repair broken objects, they aggrandize the damage by filling the cracks with gold. They believe that when something has suffered damage and has a history, it becomes more beautiful."
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default KintsugiVesselPage
