"""
AI Pre- and Post-Call Moderation Module.
Provides pattern and keyword screening for user inputs and AI model outputs using dynamic JSON rules.
"""
import os
import re
import json
import logging
from enum import Enum
from typing import List, Tuple, Dict, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("kintsugi.ai.moderation")

# Locate moderation configuration file dynamically
DEFAULT_CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "config",
    "moderation_rules.json"
)


class RiskLevel(str, Enum):
    SAFE = "SAFE"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskAssessment(BaseModel):
    """
    Data structure representing pre-call risk screening results on user input.
    """
    risk_level: RiskLevel = Field(RiskLevel.SAFE, description="Assessed risk level")
    matched_rules: List[str] = Field(default_factory=list, description="Matched keyword/pattern rules")
    is_flagged: bool = Field(False, description="Flag indicating medium, high, or critical risk")


class ModerationResult(BaseModel):
    """
    Data structure representing post-call moderation results on AI outputs.
    """
    is_safe: bool = Field(True, description="Safety evaluation flag")
    reason: Optional[str] = Field(None, description="Reason for output suppression if unsafe")


def _load_moderation_rules(config_path: str = DEFAULT_CONFIG_PATH) -> Dict[str, Any]:
    """
    Loads moderation rule definitions from JSON config file.
    """
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as err:
            logger.error(f"Failed to load moderation rules from {config_path}: {err}")

    # Default fallback rules if file cannot be read
    return {
        "user_rules": {
            "critical": {
                "keywords": ["suicide", "kill myself", "end my life", "want to die", "overdose"],
                "patterns": []
            },
            "high": {
                "keywords": ["self-harm", "cutting myself", "hurting myself"],
                "patterns": []
            }
        },
        "ai_rules": {
            "prohibited_clinical_phrases": ["i diagnose you", "my medical diagnosis", "i prescribe"],
            "prohibited_harmful_phrases": ["you should end your life", "methods for suicide"],
            "max_response_length": 4000
        }
    }


def screen_user_message(text: str, config_path: str = DEFAULT_CONFIG_PATH) -> RiskAssessment:
    """
    Screens incoming user message text against configured risk rules before AI invocation.
    """
    if not text:
        return RiskAssessment(risk_level=RiskLevel.SAFE, matched_rules=[], is_flagged=False)

    rules_data = _load_moderation_rules(config_path).get("user_rules", {})
    text_lower = text.lower()

    # Priority check: Critical -> High -> Medium -> Low
    for level_key, level_enum in [
        ("critical", RiskLevel.CRITICAL),
        ("high", RiskLevel.HIGH),
        ("medium", RiskLevel.MEDIUM),
        ("low", RiskLevel.LOW),
    ]:
        level_rules = rules_data.get(level_key, {})
        keywords = level_rules.get("keywords", [])
        patterns = level_rules.get("patterns", [])

        matched = []
        for kw in keywords:
            if kw.lower() in text_lower:
                matched.append(f"keyword:{kw}")

        for pat in patterns:
            try:
                if re.search(pat, text_lower, re.IGNORECASE):
                    matched.append(f"pattern:{pat}")
            except re.error:
                pass

        if matched:
            is_flagged = level_enum in (RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL)
            logger.info(f"User message risk screened: level={level_enum.value}, matched={matched}")
            return RiskAssessment(
                risk_level=level_enum,
                matched_rules=matched,
                is_flagged=is_flagged,
            )

    return RiskAssessment(risk_level=RiskLevel.SAFE, matched_rules=[], is_flagged=False)


def screen_ai_reply(text: str, config_path: str = DEFAULT_CONFIG_PATH) -> ModerationResult:
    """
    Performs post-call sanity check on AI generated text before returning to client.
    """
    if not text or not text.strip():
        return ModerationResult(is_safe=False, reason="Empty AI response generated")

    ai_rules = _load_moderation_rules(config_path).get("ai_rules", {})
    text_lower = text.lower()

    # 1. Check max response length
    max_len = ai_rules.get("max_response_length", 4000)
    if len(text) > max_len:
        logger.warning(f"AI response exceeded max length ({len(text)} > {max_len})")
        return ModerationResult(is_safe=False, reason="Response exceeded maximum allowable length")

    # 2. Check clinical claims
    for phrase in ai_rules.get("prohibited_clinical_phrases", []):
        if phrase.lower() in text_lower:
            logger.warning(f"AI output flagged for prohibited clinical claim: '{phrase}'")
            return ModerationResult(is_safe=False, reason="Response contained prohibited clinical claims")

    # 3. Check harmful phrases
    for phrase in ai_rules.get("prohibited_harmful_phrases", []):
        if phrase.lower() in text_lower:
            logger.warning(f"AI output flagged for prohibited harmful phrase: '{phrase}'")
            return ModerationResult(is_safe=False, reason="Response contained unsafe content")

    # 4. Check prompt leakage
    for phrase in ai_rules.get("prohibited_prompt_leakage", []):
        if phrase.lower() in text_lower:
            logger.warning(f"AI output flagged for potential prompt leakage: '{phrase}'")
            return ModerationResult(is_safe=False, reason="Response contained internal instructions")

    return ModerationResult(is_safe=True, reason=None)


def check_content_safety(text: str) -> Tuple[bool, str]:
    """
    Legacy adapter function for backward compatibility with existing imports.
    Returns (is_safe: bool, severity_string: str)
    """
    assessment = screen_user_message(text)
    if assessment.is_flagged:
        return False, assessment.risk_level.value.lower()
    return True, "none"
