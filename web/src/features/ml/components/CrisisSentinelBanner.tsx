import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PhoneCall, HeartHandshake, X } from 'lucide-react';

export const CrisisSentinelBanner: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="glass-card p-3 border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-amber-200 font-medium">
            Kintsugi Safety Sentinel Active — 24/7 Crisis Support Available
          </span>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="text-xs font-semibold px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 transition-colors flex items-center gap-1.5"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Emergency Helplines
        </button>
      </div>

      <AnimatePresence>
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel-glow max-w-md w-full p-6 text-white relative"
            >
              <button
                onClick={() => setOpenModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Emergency Support Sanctuary</h3>
                  <p className="text-xs text-zinc-400">You are never alone. Confidential help is ready right now.</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href="tel:9152987821"
                  className="block glass-card p-3 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-amber-300">Vandrevala Foundation Helpline (India)</span>
                    <span className="text-xs font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded">9999 666 555</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">24x7 Free Mental Health Counseling</p>
                </a>

                <a
                  href="tel:988"
                  className="block glass-card p-3 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-amber-300">Suicide & Crisis Lifeline (US/Canada)</span>
                    <span className="text-xs font-mono font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded">Call or Text 988</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Free, confidential support available 24/7</p>
                </a>
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <p className="text-xs text-purple-200">
                  Try our grounding 4-7-8 breathing exercise in the Sanctuary tab if you need immediate calm.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
