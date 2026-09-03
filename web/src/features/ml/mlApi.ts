/**
 * Machine Learning API Client Module for Kintsugi Web Client.
 * Connects frontend features to FastAPI ML Endpoints (/api/v1/ml/*).
 */
import { apiClient } from '@/lib/api/apiClient';

export interface MLSentimentResult {
  valence: number;
  arousal: number;
  dominance: number;
  primary_emotion: string;
  confidence: number;
  emotion_breakdown: Record<string, number>;
}

export interface MLRiskResult {
  risk_score: number;
  risk_level: string;
  flagged_crisis: boolean;
  triggers_detected: string[];
  action_recommended: string;
}

export interface MLForecastDay {
  day_index: number;
  day_label: string;
  predicted_valence: number;
  predicted_mood: string;
}

export interface MLForecastResult {
  burnout_risk_percentage: number;
  emotional_stability_score: number;
  emotional_volatility: number;
  emotional_momentum: string;
  trajectory_summary: string;
  forecast_7d: MLForecastDay[];
}

export const mlApi = {
  analyzeSentiment: async (text: string): Promise<MLSentimentResult> => {
    const response = await apiClient.post('/ml/analyze-sentiment', { text });
    return response.data;
  },

  predictRisk: async (text: string): Promise<MLRiskResult> => {
    const response = await apiClient.post('/ml/predict-risk', { text });
    return response.data;
  },

  forecastMood: async (moodHistory: any[] = []): Promise<MLForecastResult> => {
    const response = await apiClient.post('/ml/forecast-mood', { mood_history: moodHistory });
    return response.data;
  },

  semanticSearch: async (query: string, entries: any[] = []): Promise<any> => {
    try {
      const response = await apiClient.post('/ml/semantic-search', { query, entries });
      return response.data;
    } catch (err) {
      console.warn('Backend semantic search endpoint unavailable, using local text similarity fallback:', err);
      const q = query.toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const scored = entries
        .map((entry) => {
          const text = `${entry.title || ''} ${entry.content || ''}`.toLowerCase().replace(/<[^>]*>?/gm, '');
          let matches = 0;
          words.forEach((w) => {
            if (text.includes(w)) matches++;
          });
          const similarity = words.length > 0 ? Math.min(0.98, (matches / words.length) * 0.8 + 0.15) : 0.5;
          return {
            ...entry,
            semantic_similarity_score: similarity,
          };
        })
        .filter((e) => e.semantic_similarity_score > 0.1)
        .sort((a, b) => b.semantic_similarity_score - a.semantic_similarity_score);

      return { results: scored };
    }
  }
};
