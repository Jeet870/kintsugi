import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { type MLForecastResult } from '../mlApi';

interface MoodForecastCardProps {
  forecast?: MLForecastResult | null;
}

export const MoodForecastCard: React.FC<MoodForecastCardProps> = ({ forecast }) => {
  const data: MLForecastResult = forecast || {
    burnout_risk_percentage: 18.5,
    emotional_stability_score: 84.0,
    emotional_volatility: 0.12,
    emotional_momentum: 'UPWARD_WELLNESS',
    trajectory_summary: 'Positive resilience compounding. Emotional equilibrium forecasted for the next 7 days.',
    forecast_7d: [
      { day_index: 1, day_label: '+1d', predicted_valence: 0.6, predicted_mood: 'calm' },
      { day_index: 2, day_label: '+2d', predicted_valence: 0.7, predicted_mood: 'happy' },
      { day_index: 3, day_label: '+3d', predicted_valence: 0.65, predicted_mood: 'calm' },
      { day_index: 4, day_label: '+4d', predicted_valence: 0.8, predicted_mood: 'happy' },
      { day_index: 5, day_label: '+5d', predicted_valence: 0.75, predicted_mood: 'calm' },
      { day_index: 6, day_label: '+6d', predicted_valence: 0.7, predicted_mood: 'calm' },
      { day_index: 7, day_label: '+7d', predicted_valence: 0.85, predicted_mood: 'happy' },
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 text-white relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-xl">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">7-Day ML Trajectory Forecast</h3>
            <p className="text-xs text-zinc-400">Predictive Emotional Momentum & Burnout Vulnerability</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
            Burnout Risk: {data.burnout_risk_percentage}%
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-300 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 mb-5 leading-relaxed">
        {data.trajectory_summary}
      </p>

      {/* 7-Day Predictive Bars */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {data.forecast_7d.map((day) => (
          <div key={day.day_index} className="glass-card p-2 flex flex-col items-center justify-between h-28">
            <span className="text-[10px] font-mono text-zinc-400">{day.day_label}</span>
            <div className="w-full bg-zinc-800/80 h-14 rounded-md relative flex items-end p-0.5 overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(15, day.predicted_valence * 100)}%` }}
                className="w-full rounded bg-gradient-to-t from-purple-600 to-amber-400"
              />
            </div>
            <span className="text-[10px] capitalize font-medium text-amber-300">
              {day.predicted_mood}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
