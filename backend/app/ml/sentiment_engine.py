"""
ML Sentiment & Emotion Classifier Engine.
Analyzes user notes, journal entries, and chat messages to compute Valence, Arousal, Dominance (VAD)
and multi-class emotion probabilities (Joy, Sadness, Anger, Anxiety, Serenity, Fatigue).
"""
import re
import math
from typing import Dict, Any, List


class MLSentimentEngine:
    """
    NLP Sentiment & Multi-dimensional Emotion Analysis Model.
    Employs lexicon weights, VAD scoring algorithms, and keyword probability mapping.
    """

    EMOTION_LEXICON = {
        "happy": {
            "keywords": ["happy", "joy", "excited", "grateful", "peaceful", "wonderful", "love", "smile", "cheerful", "light", "content", "blessed", "optimistic", "proud", "fulfilled", "inspired"],
            "valence": 0.85, "arousal": 0.65, "dominance": 0.75
        },
        "calm": {
            "keywords": ["calm", "relax", "peace", "serene", "tranquil", "quiet", "zen", "mindful", "rested", "balanced", "still", "breathe", "mellow", "composed"],
            "valence": 0.70, "arousal": 0.20, "dominance": 0.65
        },
        "sad": {
            "keywords": ["sad", "depressed", "lonely", "crying", "heartbroken", "gloomy", "empty", "hopeless", "grief", "sorrow", "hurt", "miserable", "disappointed", "tears"],
            "valence": -0.75, "arousal": -0.40, "dominance": -0.50
        },
        "angry": {
            "keywords": ["angry", "furious", "mad", "annoyed", "frustrated", "rage", "hate", "irritated", "resentful", "bitter", "outraged", "offended", "hostile"],
            "valence": -0.65, "arousal": 0.80, "dominance": 0.70
        },
        "anxious": {
            "keywords": ["anxious", "worried", "nervous", "scared", "fear", "panic", "overwhelmed", "stressed", "uneasy", "dread", "terrified", "tense", "insecure", "restless"],
            "valence": -0.60, "arousal": 0.75, "dominance": -0.60
        },
        "tired": {
            "keywords": ["tired", "exhausted", "drained", "fatigued", "sleepy", "weary", "burnt", "burnout", "sluggish", "heavy", "low energy", "worn out"],
            "valence": -0.40, "arousal": -0.70, "dominance": -0.40
        }
    }

    @classmethod
    def analyze_text(cls, text: str) -> Dict[str, Any]:
        """
        Performs NLP analysis on input text.
        Returns VAD scores, primary emotion tag, confidence score, and emotion breakdown.
        """
        if not text or not text.strip():
            return {
                "valence": 0.0,
                "arousal": 0.0,
                "dominance": 0.0,
                "primary_emotion": "calm",
                "confidence": 0.5,
                "emotion_breakdown": {k: 0.166 for k in cls.EMOTION_LEXICON.keys()}
            }

        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        total_words = max(len(words), 1)

        scores: Dict[str, float] = {emotion: 0.0 for emotion in cls.EMOTION_LEXICON}
        weighted_valence = 0.0
        weighted_arousal = 0.0
        weighted_dominance = 0.0
        matches = 0

        for emotion, data in cls.EMOTION_LEXICON.items():
            for kw in data["keywords"]:
                count = text_lower.count(kw)
                if count > 0:
                    scores[emotion] += count * 1.5
                    weighted_valence += count * data["valence"]
                    weighted_arousal += count * data["arousal"]
                    weighted_dominance += count * data["dominance"]
                    matches += count

        # Normalize probability distribution using Softmax-like scaling
        total_score = sum(scores.values())
        if total_score > 0:
            probabilities = {k: round(v / total_score, 4) for k, v in scores.items()}
            norm_valence = max(-1.0, min(1.0, round(weighted_valence / matches, 3)))
            norm_arousal = max(-1.0, min(1.0, round(weighted_arousal / matches, 3)))
            norm_dominance = max(-1.0, min(1.0, round(weighted_dominance / matches, 3)))
            confidence = min(0.95, round(0.5 + (matches / (total_words + 2)), 2))
        else:
            # Neutral baseline
            probabilities = {k: 0.166 for k in cls.EMOTION_LEXICON.keys()}
            probabilities["calm"] = 0.35
            norm_valence = 0.1
            norm_arousal = 0.0
            norm_dominance = 0.2
            confidence = 0.45

        # Determine primary emotion
        primary_emotion = max(probabilities, key=probabilities.get)

        return {
            "text_length": len(text),
            "valence": norm_valence,
            "arousal": norm_arousal,
            "dominance": norm_dominance,
            "primary_emotion": primary_emotion,
            "confidence": confidence,
            "emotion_breakdown": probabilities
        }


ml_sentiment_engine = MLSentimentEngine()
