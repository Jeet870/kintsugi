import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Activity } from 'lucide-react';
import { mlApi, type MLSentimentResult } from '../mlApi';

interface MLSentimentRadarProps {
  initialText?: string;
}

export const MLSentimentRadar: React.FC<MLSentimentRadarProps> = ({ initialText = '' }) => {
  const [inputText, setInputText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MLSentimentResult | null>({
    valence: 0.65,
    arousal: 0.25,
    dominance: 0.70,
    primary_emotion: 'calm',
    confidence: 0.88,
    emotion_breakdown: {
      happy: 0.25,
      calm: 0.55,
      anxious: 0.10,
      sad: 0.05,
      angry: 0.02,
      tired: 0.03
    }
  });

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const data = await mlApi.analyzeSentiment(inputText);
      setResult(data);
    } catch (err) {
      console.error('Failed to run ML sentiment analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-glow p-6 text-white relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl">
            <Brain className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg gold-gradient-text">ML Emotion & Valence Radar</h3>
            <p className="text-xs text-zinc-400">Real-time NLP Multi-Dimensional Sentiment Classification</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Sparkles className="w-3.5 h-3.5" /> NLP Model Live
        </span>
      </div>

      {/* Input Field for Custom Text Testing */}
      <div className="mb-5 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type how you are feeling to run real-time ML analysis..."
          className="flex-1 bg-zinc-900/60 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          className="glass-button px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Valence & Arousal Card */}
          <div className="glass-card p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" /> Emotional Valence
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {result.valence > 0 ? `+${result.valence}` : result.valence}
              </span>
            </div>
            <div className="w-full bg-zinc-800/60 h-2 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-amber-300 transition-all duration-500"
                style={{ width: `${Math.max(5, ((result.valence + 1) / 2) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Primary Emotion:</span>
              <span className="font-semibold capitalize text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {result.primary_emotion}
              </span>
            </div>
          </div>

          {/* Emotion Probability Bars */}
          <div className="glass-card p-4 md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Emotion Breakdown Probabilities</span>
              <span>Model Confidence: {(result.confidence * 100).toFixed(0)}%</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(result.emotion_breakdown).map(([emotion, prob]) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="capitalize text-zinc-300">{emotion}</span>
                    <span className="text-zinc-400 font-mono">{(prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        emotion === 'happy' || emotion === 'calm'
                          ? 'bg-amber-400'
                          : emotion === 'anxious' || emotion === 'sad'
                          ? 'bg-purple-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.max(3, prob * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
