"""
ML Mood Forecasting & Burnout Predictor Engine.
Analyzes sequential historical mood logs to compute emotional momentum, emotional volatility,
7-day predictive mood trajectory, and burnout risk percentage.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta


class MLMoodForecaster:
    """
    Time-Series Mood Trajectory & Burnout Predictor Model.
    Calculates emotional momentum vectors and forecast trajectories over 7 days.
    """

    MOOD_VALENCE_WEIGHTS = {
        "happy": 1.0,
        "calm": 0.7,
        "tired": 0.0,
        "anxious": -0.5,
        "sad": -0.8,
        "angry": -1.0
    }

    @classmethod
    def forecast_user_mood(cls, mood_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes historical mood logs (ordered chronologically or reverse)
        to compute 7-day predictive trajectory and burnout risk scoring.
        """
        if not mood_logs:
            return {
                "burnout_risk_percentage": 15.0,
                "emotional_stability_score": 85.0,
                "emotional_momentum": "NEUTRAL",
                "trajectory_summary": "Insufficient data to compute dynamic forecast. Keep logging moods daily!",
                "forecast_7d": [
                    {"day": f"Day {i+1}", "predicted_valence": 0.5, "predicted_mood": "calm"}
                    for i in range(7)
                ]
            }

        # Convert entries to valence points
        valences = []
        for log in mood_logs:
            m_type = str(log.get("mood_type", "calm")).lower()
            v = cls.MOOD_VALENCE_WEIGHTS.get(m_type, 0.2)
            valences.append(v)

        n = len(valences)
        recent_valences = valences[-7:] if n >= 7 else valences
        avg_valence = sum(recent_valences) / len(recent_valences)

        # Compute emotional volatility (standard deviation of recent valence)
        variance = sum((x - avg_valence) ** 2 for x in recent_valences) / len(recent_valences)
        volatility = round(variance ** 0.5, 3)

        # Compute Burnout Risk
        # Burnout spikes when negative valence persists with high volatility or prolonged 'tired'/'anxious'
        negative_count = sum(1 for x in recent_valences if x < 0)
        burnout_risk = min(99.0, max(5.0, (negative_count / len(recent_valences)) * 75.0 + (volatility * 25.0)))

        # Stability score
        stability = round(max(0.0, 100.0 - (volatility * 60.0) - (burnout_risk * 0.3)), 1)

        # Compute Momentum
        if len(recent_valences) >= 2:
            delta = recent_valences[-1] - recent_valences[0]
            if delta > 0.3:
                momentum = "UPWARD_WELLNESS"
            elif delta < -0.3:
                momentum = "DOWNWARD_STRAIN"
            else:
                momentum = "STABLE"
        else:
            momentum = "STABLE"

        # Generate 7-Day Forecast Trajectory
        forecast = []
        last_v = recent_valences[-1] if recent_valences else 0.5
        slope = (avg_valence - last_v) * 0.1

        for i in range(1, 8):
            next_v = max(-1.0, min(1.0, last_v + (slope * i) + (0.05 * (1 if avg_valence > 0 else -1))))
            if next_v > 0.6:
                pred_mood = "happy"
            elif next_v > 0.2:
                pred_mood = "calm"
            elif next_v > -0.2:
                pred_mood = "tired"
            elif next_v > -0.6:
                pred_mood = "anxious"
            else:
                pred_mood = "sad"

            forecast.append({
                "day_index": i,
                "day_label": f"+{i}d",
                "predicted_valence": round(next_v, 2),
                "predicted_mood": pred_mood
            })

        # Summary text
        if burnout_risk > 60:
            summary = "High emotional strain detected. Consider scheduling a 5-minute breathing break or journal entry."
        elif momentum == "UPWARD_WELLNESS":
            summary = "Positive emotional trajectory detected! Your resilience streak is compounding."
        else:
            summary = "Balanced emotional equilibrium maintained. Consistent logging supports long-term mental clarity."

        return {
            "burnout_risk_percentage": round(burnout_risk, 1),
            "emotional_stability_score": stability,
            "emotional_volatility": volatility,
            "emotional_momentum": momentum,
            "trajectory_summary": summary,
            "forecast_7d": forecast
        }


ml_mood_forecaster = MLMoodForecaster()
