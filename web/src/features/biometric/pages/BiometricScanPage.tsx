import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Activity, RefreshCw, CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export function BiometricScanPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)

  const [metrics, setMetrics] = useState({
    hrv: 68,
    heartRate: 72,
    stressIndex: 'Optimal (22%)',
    facialValence: '+0.74 Positive',
    microTension: 'Low',
    voicePitchStability: '94%',
  })

  // Simulated Facial Mesh Tracking Visualizer on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let frame = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      // Draw Grid overlay
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw Simulated Face Contour Landmark Mesh
      ctx.save()
      ctx.strokeStyle = isScanning ? '#D4AF37' : 'rgba(139, 92, 246, 0.6)'
      ctx.lineWidth = 2

      // Head Oval
      ctx.beginPath()
      ctx.ellipse(cx, cy - 10, 90, 120, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Eye Landmarks
      const eyeOffset = Math.sin(frame * 0.05) * 2
      ctx.beginPath()
      ctx.arc(cx - 35, cy - 30 + eyeOffset, 12, 0, Math.PI * 2)
      ctx.arc(cx + 35, cy - 30 + eyeOffset, 12, 0, Math.PI * 2)
      ctx.stroke()

      // Smile Curve Landmark
      ctx.beginPath()
      ctx.arc(cx, cy + 30, 35, 0.2 * Math.PI, 0.8 * Math.PI)
      ctx.stroke()

      // Landmark Dots
      const points = [
        [cx - 35, cy - 30],
        [cx + 35, cy - 30],
        [cx, cy + 5],
        [cx - 25, cy + 35],
        [cx + 25, cy + 35],
        [cx, cy - 70],
      ]
      points.forEach(([px, py]) => {
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#D4AF37'
        ctx.fill()
      })

      // Laser Scan Line when scanning
      if (isScanning) {
        const scanY = (frame * 3) % canvas.height
        ctx.beginPath()
        ctx.moveTo(0, scanY)
        ctx.lineTo(canvas.width, scanY)
        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth = 3
        ctx.shadowColor = '#D4AF37'
        ctx.shadowBlur = 10
        ctx.stroke()
      }

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isScanning])

  const startBiometricScan = () => {
    setIsScanning(true)
    setProgress(0)
    setScanComplete(false)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setScanComplete(true)
          setMetrics({
            hrv: Math.floor(65 + Math.random() * 15),
            heartRate: Math.floor(68 + Math.random() * 8),
            stressIndex: 'Optimal Resilience (18%)',
            facialValence: '+0.82 High Positivity',
            microTension: 'Zero Detected',
            voicePitchStability: '98% Balanced',
          })
          return 100
        }
        return prev + 10
      })
    }, 250)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[#D4AF37]/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs px-3 py-1">
                AI Vision & Telemetry Layer
              </Badge>
              <Badge className="bg-[#2DD4BF]/20 border-[#2DD4BF]/40 text-[#2DD4BF] font-mono text-xs px-3 py-1">
                Zero Cloud Upload Privacy First
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              AI Biometric & Stress Scanner
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
              Non-invasive real-time micro-expression analysis, Heart Rate Variability (HRV) telemetry, and vocal resonance stress scoring.
            </p>
          </div>

          <Button
            onClick={startBiometricScan}
            disabled={isScanning}
            className="bg-[#D4AF37] hover:bg-[#F2CA50] text-[#0B0D17] font-extrabold text-base px-8 py-6 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Scanning ({progress}%)...</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Initiate Biometric Scan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Scan Viewport & Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Canvas Viewport */}
        <Card className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-[#D4AF37]/25 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
              Facial Landmark & Mesh Feed
            </span>
          </div>

          <canvas ref={canvasRef} width={420} height={300} className="w-full max-w-[420px] h-[300px] rounded-xl" />

          {isScanning && (
            <div className="w-full max-w-[420px] mt-4 space-y-1">
              <div className="flex justify-between text-xs font-mono text-[#D4AF37]">
                <span>Analyzing Micro-Tension...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#D4AF37] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Right Column: Telemetry Breakdown Grid */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/25 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#D4AF37]" />
              <span>Biometric Diagnostic Telemetry</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-background/50 rounded-xl border border-border">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">HRV Coherence</div>
                <div className="text-2xl font-mono font-bold text-[#D4AF37] mt-1">{metrics.hrv} ms</div>
                <div className="text-[10px] text-[#2DD4BF] mt-0.5">Optimal Balance</div>
              </div>

              <div className="p-3.5 bg-background/50 rounded-xl border border-border">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">Resting Pulse</div>
                <div className="text-2xl font-mono font-bold text-[#8B5CF6] mt-1">{metrics.heartRate} BPM</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Calm Resting</div>
              </div>

              <div className="p-3.5 bg-background/50 rounded-xl border border-border col-span-2">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">Facial Valence Classification</div>
                <div className="text-lg font-bold text-foreground mt-1">{metrics.facialValence}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Detected via micro-expression vectors</div>
              </div>

              <div className="p-3.5 bg-background/50 rounded-xl border border-border">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">Vocal Pitch Stress</div>
                <div className="text-lg font-bold text-[#2DD4BF] mt-1">{metrics.voicePitchStability}</div>
              </div>

              <div className="p-3.5 bg-background/50 rounded-xl border border-border">
                <div className="text-[11px] font-mono text-muted-foreground uppercase">Micro-Tension</div>
                <div className="text-lg font-bold text-[#D4AF37] mt-1">{metrics.microTension}</div>
              </div>
            </div>
          </Card>

          {scanComplete && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-panel p-5 rounded-2xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#2DD4BF] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Biomarker Diagnostic</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Your physiological biomarkers indicate high autonomic coherence. Your HRV is 14% higher than your 7-day average. Excellent state for creative focus or journaling!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BiometricScanPage
