"""
ML Crisis Sentinel & Safety Risk Evaluator Model.
Detects emergency distress patterns, self-harm signals, and critical mental health triggers
to immediately activate safety protocols, helpline banners, and notification webhooks.
"""
import re
from typing import Dict, Any, List


class MLCrisisSentinel:
    """
    ML Distress & Emergency Risk Scoring Model.
    Categorizes inputs into risk tiers: LOW, MODERATE, HIGH, SEVERE.
    """

    CRITICAL_TRIGGERS = [
        "suicide", "suicidal", "kill myself", "want to die", "end my life",
        "self harm", "cutting myself", "don't want to live", "no reason to live",
        "better off dead", "goodbye world", "overdose", "ending it all"
    ]

    HIGH_RISK_TRIGGERS = [
        "cannot go on", "can't take this anymore", "unbearable pain", "nobody cares",
        "completely hopeless", "trapped forever", "extreme agony", "panic attack"
    ]

    @classmethod
    def evaluate_risk(cls, text: str) -> Dict[str, Any]:
        """
        Evaluates input text for crisis risk indicators.
        Returns risk_score (0.0 to 1.0), risk_level, triggers_detected, and recommended_action.
        """
        if not text:
            return {
                "risk_score": 0.0,
                "risk_level": "LOW",
                "flagged_crisis": False,
                "triggers_detected": [],
                "action_recommended": "NONE"
            }

        text_lower = text.lower()
        detected_critical: List[str] = []
        detected_high: List[str] = []

        for trig in cls.CRITICAL_TRIGGERS:
            if re.search(r'\b' + re.escape(trig) + r'\b', text_lower):
                detected_critical.append(trig)

        for trig in cls.HIGH_RISK_TRIGGERS:
            if re.search(r'\b' + re.escape(trig) + r'\b', text_lower):
                detected_high.append(trig)

        critical_count = len(detected_critical)
        high_count = len(detected_high)

        if critical_count >= 1:
            risk_score = min(1.0, 0.85 + (critical_count * 0.05))
            risk_level = "SEVERE" if critical_count >= 2 else "HIGH"
            flagged = True
            action = "IMMEDIATE_EMERGENCY_INTERVENTION"
        elif high_count >= 2:
            risk_score = 0.65
            risk_level = "HIGH"
            flagged = True
            action = "SHOW_HELPLINE_RESOURCES"
        elif high_count == 1:
            risk_score = 0.40
            risk_level = "MODERATE"
            flagged = False
            action = "OFFER_CALMING_EXERCISES"
        else:
            risk_score = 0.05
            risk_level = "LOW"
            flagged = False
            action = "NONE"

        return {
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "flagged_crisis": flagged,
            "triggers_detected": detected_critical + detected_high,
            "action_recommended": action
        }


ml_crisis_sentinel = MLCrisisSentinel()
