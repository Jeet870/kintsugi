import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { User, Layout, Server, Shield, Cpu, Database, Radio, ArrowRight } from 'lucide-react'

export const ArchitectureDiagram: React.FC = () => {
  const shouldReduceMotion = useReducedMotion()
  const isAnimated = !shouldReduceMotion

  const nodes = [
    { label: 'User Client', role: 'Browser / iOS', icon: User, color: 'border-violet-500/40 text-violet-400 bg-violet-500/10' },
    { label: 'React 19 App', role: 'Vite + Tailwind', icon: Layout, color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { label: 'FastAPI Gateway', role: 'Async Python', icon: Server, color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { label: 'Security Layer', role: 'JWT & Sanitize', icon: Shield, color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { label: 'AI Engine', role: 'Mistral & Prompts', icon: Cpu, color: 'border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10' },
    { label: 'Database & Cache', role: 'MySQL + Redis', icon: Database, color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { label: 'Realtime Sync', role: 'WebSocket PubSub', icon: Radio, color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground backdrop-blur-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h4 className="text-lg font-bold text-card-foreground font-serif">Kintsugi System Request Lifecycle</h4>
          <p className="text-xs text-muted-foreground">End-to-end data flow from client user input to encrypted realtime persistence</p>
        </div>
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          ● Production Architecture
        </span>
      </div>

      {/* Nodes Flowchart Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-center">
        {nodes.map((node, idx) => {
          const Icon = node.icon

          return (
            <React.Fragment key={node.label}>
              <motion.div
                className={`p-3.5 rounded-xl border ${node.color} space-y-1 text-center relative group hover:scale-105 transition-all shadow-sm`}
                initial={isAnimated ? { opacity: 0, y: 16 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="w-8 h-8 rounded-lg bg-card border border-border mx-auto flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-card-foreground font-serif">{node.label}</div>
                <div className="text-[10px] text-muted-foreground">{node.role}</div>
              </motion.div>

              {idx < nodes.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ArchitectureDiagram
