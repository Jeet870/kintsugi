import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, Radio, Music, CloudRain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface SolfeggioTrack {
  id: string
  freq: number
  title: string
  subtitle: string
  desc: string
  color: string
}

const SOLFEGGIO_TRACKS: SolfeggioTrack[] = [
  {
    id: '528',
    freq: 528,
    title: '528 Hz — DNA & Transformation',
    subtitle: 'Miracle Repair Tone',
    desc: 'Brings transformation and miracles into your life, reduces cortisol and promotes emotional clarity.',
    color: '#D4AF37',
  },
  {
    id: '432',
    freq: 432,
    title: '432 Hz — Universal Harmony',
    subtitle: 'Cosmic Relaxation',
    desc: 'Tuned to the natural frequency of the cosmos to release anxiety and align heart coherence.',
    color: '#8B5CF6',
  },
  {
    id: '639',
    freq: 639,
    title: '639 Hz — Heart Interconnection',
    subtitle: 'Harmonious Relationships',
    desc: 'Enhances communication, empathy, and deep interpersonal understanding.',
    color: '#2DD4BF',
  },
  {
    id: 'theta',
    freq: 110,
    title: '4 Hz Theta — Deep Meditation',
    subtitle: 'Subconscious Healing',
    desc: 'Deep brainwave synchronization for deep REM sleep, intuitive insight, and stress relief.',
    color: '#3B82F6',
  },
]

export function SoundscapePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const [activeTrack, setActiveTrack] = useState<SolfeggioTrack>(SOLFEGGIO_TRACKS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [rainVolume, setRainVolume] = useState(30)

  // Start / Stop Web Audio Tone Generator
  const togglePlay = (track?: SolfeggioTrack) => {
    const target = track || activeTrack

    if (isPlaying && (!track || track.id === activeTrack.id)) {
      // Stop Audio
      if (oscRef.current) {
        oscRef.current.stop()
        oscRef.current.disconnect()
        oscRef.current = null
      }
      setIsPlaying(false)
      return
    }

    // Stop current track if playing
    if (oscRef.current) {
      oscRef.current.stop()
      oscRef.current.disconnect()
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(target.freq, ctx.currentTime)
      gain.gain.setValueAtTime((volume / 100) * 0.15, ctx.currentTime)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      oscRef.current = osc
      gainRef.current = gain
      setActiveTrack(target)
      setIsPlaying(true)
    } catch {
      setIsPlaying(true)
    }
  }

  // Update volume live
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime((volume / 100) * 0.15, audioCtxRef.current.currentTime)
    }
  }, [volume])

  // Canvas Real-Time Sound Wave Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let phase = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      phase += isPlaying ? 0.05 : 0.01

      const width = canvas.width
      const height = canvas.height
      const centerY = height / 2

      // Draw multiple sine wave layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath()
        ctx.moveTo(0, centerY)

        for (let x = 0; x < width; x += 3) {
          const freq = (activeTrack.freq / 100) * (layer + 1)
          const amp = isPlaying ? 25 - layer * 5 : 4
          const y = centerY + Math.sin(x * 0.015 * freq + phase + layer) * amp

          ctx.lineTo(x, y)
        }

        ctx.strokeStyle =
          layer === 0
            ? activeTrack.color
            : layer === 1
            ? 'rgba(139, 92, 246, 0.5)'
            : 'rgba(45, 212, 191, 0.3)'
        ctx.lineWidth = 3 - layer * 0.8
        ctx.stroke()
      }

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, activeTrack])

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[#8B5CF6]/30">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#8B5CF6] font-mono text-xs px-3 py-1">
                Web Audio API Synthesizer
              </Badge>
              <Badge className="bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37] font-mono text-xs px-3 py-1">
                Solfeggio Healing Matrix
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Soundscape & Frequency Sanctuary
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm sm:text-base">
              Harness mathematically precise sound frequencies and binaural beats to lower stress, balance your nervous system, and induce deep meditative states.
            </p>
          </div>

          <Button
            onClick={() => togglePlay()}
            className={`px-8 py-6 rounded-2xl font-extrabold text-base shadow-xl flex items-center gap-3 cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[#8B5CF6]/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span>Pause Soundscape</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>Play {activeTrack.freq}Hz Tone</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Waveform Visualizer & Solfeggio Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-Time Audio Canvas Visualizer & Sliders */}
        <Card className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-[#8B5CF6]/25 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className={`w-5 h-5 ${isPlaying ? 'text-[#D4AF37] animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-sm font-bold tracking-wide">Live Audio Frequency Visualizer</span>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-[#D4AF37] border-[#D4AF37]/30">
              {activeTrack.freq} Hz Active
            </Badge>
          </div>

          {/* Canvas Wave Visualizer */}
          <div className="w-full bg-[#0B0D17]/80 rounded-xl p-4 border border-border relative overflow-hidden flex flex-col items-center justify-center">
            <canvas ref={canvasRef} width={600} height={180} className="w-full h-[180px] rounded-lg" />
            <div className="absolute bottom-2 right-4 text-[10px] font-mono text-muted-foreground/60">
              Web Audio Synthesizer Node
            </div>
          </div>

          {/* Controls Sliders */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Solfeggio Tone Volume</span>
                </span>
                <span className="font-mono text-[#D4AF37]">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Ambient Rain & Brown Noise Mix</span>
                </span>
                <span className="font-mono text-[#8B5CF6]">{rainVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rainVolume}
                onChange={(e) => setRainVolume(Number(e.target.value))}
                className="w-full accent-[#8B5CF6] cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Right Column: Track Selector Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Music className="w-5 h-5 text-[#D4AF37]" />
            <span>Select Frequency Frequency</span>
          </h2>

          {SOLFEGGIO_TRACKS.map((track) => {
            const isSelected = activeTrack.id === track.id
            return (
              <div
                key={track.id}
                onClick={() => togglePlay(track)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'glass-panel border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'glass-card hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{track.title}</span>
                      {isSelected && isPlaying && (
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{track.desc}</p>
                  </div>
                  <Badge
                    className="font-mono text-[10px] shrink-0"
                    style={{ backgroundColor: `${track.color}20`, color: track.color, borderColor: `${track.color}40` }}
                  >
                    {track.freq} Hz
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SoundscapePage
