import { Link } from 'react-router-dom'
import { Sparkles, Shield, PhoneCall, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border transition-colors">
      {/* Crisis Banner */}
      <div className="bg-rose-500/10 border-b border-rose-500/20 py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-rose-700 dark:text-rose-200 font-medium">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-bounce" />
            <span>Experiencing distress or suicidal thoughts? You are not alone.</span>
          </div>
          <div className="flex items-center gap-3 font-bold text-rose-900 dark:text-white">
            <span>Tele-MANAS: <a href="tel:14416" className="underline hover:text-rose-500">14416</a></span>
            <span>•</span>
            <span>Vandrevala: <a href="tel:9999666555" className="underline hover:text-rose-500">9999-666-555</a></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-600 to-violet-600 p-0.5">
                <div className="w-full h-full bg-background rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-foreground tracking-tight font-serif">Kintsugi</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Named after the Japanese art of golden joinery (金継ぎ). Emotional fractures are not flaws to conceal, but proof of resilience and beauty.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Companion Modules</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/app/mood" className="hover:text-amber-500 transition-colors">Mood Tracker & AI</Link></li>
              <li><Link to="/app/chat" className="hover:text-amber-500 transition-colors">AI Companion Chat</Link></li>
              <li><Link to="/app/journal" className="hover:text-amber-500 transition-colors">Encrypted Journal</Link></li>
              <li><Link to="/app/motivation" className="hover:text-amber-500 transition-colors">Daily Motivation & Badges</Link></li>
            </ul>
          </div>

          {/* Safety & Emergency */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Safety Architecture</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/app/emergency" className="hover:text-rose-500 transition-colors flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Pre-Call Safety Shield</Link></li>
              <li><a href="https://telemanas.mhop.mohfw.gov.in/" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1">Tele-MANAS Portal <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://www.vandrevalafoundation.com/" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1">Vandrevala Helpline <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Legal & Medical Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Important Disclaimer</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kintsugi is a supportive wellness companion. It does not provide medical diagnosis, clinical psychiatric treatment, or psychotherapy. If you require medical help, consult a licensed healthcare professional immediately.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Kintsugi Mental Health & Wellness Companion. All rights reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>FastAPI + React 19 + Tailwind</span>
            <span>Fernet Encryption</span>
            <span>Mistral AI Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
