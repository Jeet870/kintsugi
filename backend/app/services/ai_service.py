"""
AI Orchestration Service.
Coordinates prompt templates, moderation checks, and abstract AI completion provider invocations.
Decoupled from specific AI vendors via the abstract AIProvider interface.
"""
import re
import logging
from typing import List, Dict, Optional, Any

from app.ai.base import AIProvider
from app.ai.mistral_provider import default_mistral_provider
from app.ai.prompts.companion_chat_prompt import get_companion_chat_prompt
from app.ai.prompts.mood_support_prompt import get_mood_support_prompt
from app.ai.moderation import screen_ai_reply

logger = logging.getLogger("kintsugi.services.ai")


def _clean_think_tags(text: str) -> str:
    """Strips raw internal model <think>...</think> reasoning blocks from AI outputs."""
    if not text:
        return ""
    cleaned = re.sub(r"(?s)<think>.*?</think>", "", text).strip()
    return cleaned if cleaned else text.strip()


class AIService:
    """
    Business service gateway for generating AI companion responses and mood supportive messages.
    Accepts an abstract AIProvider instance for vendor-agnostic extensibility.
    """
    def __init__(self, provider: Optional[AIProvider] = None):
        self.provider = provider or default_mistral_provider

    def generate_chat_reply(
        self,
        history: Optional[List[Dict[str, str]]] = None,
        new_message: Optional[str] = None,
        system_prompt: Optional[str] = None,
        messages: Optional[List[Dict[str, str]]] = None,
        user_id: Optional[int] = None,
        **kwargs,
    ) -> str:
        """
        Generates a plain-text AI companion reply given recent conversation history and an optional new message.
        """
        prompt = system_prompt or get_companion_chat_prompt()
        input_history = messages if messages is not None else (history or [])
        messages_payload = list(input_history)

        if new_message:
            messages_payload.append({"role": "user", "content": new_message})

        if not messages_payload:
            messages_payload.append({"role": "user", "content": "Hello"})

        try:
            raw_reply = self.provider.generate_completion(
                messages=messages_payload,
                system_prompt=prompt,
                temperature=0.6,
                max_tokens=350,
            )
        except Exception as err:
            logger.warning(f"AI provider call failed, falling back to dynamic CBT response: {err}")
            return default_mistral_provider.client._generate_dynamic_fallback(messages_payload)

        # Post-call moderation check
        mod_result = screen_ai_reply(raw_reply)
        if not mod_result.is_safe:
            logger.warning(f"AI response intercepted by moderation: {mod_result.reason}")
            return default_mistral_provider.client._generate_dynamic_fallback(messages_payload)

        return raw_reply

    # Alias for backward compatibility
    generate_companion_response = generate_chat_reply

    def generate_mood_message(self, mood_type: str, note: Optional[str] = None) -> str:
        """
        Generates a short (2-3 sentence) supportive, non-clinical message for a logged mood.
        """
        prompt = get_mood_support_prompt(mood_type)
        user_content = f"I just logged my mood as {mood_type}."
        if note:
            user_content += f" Note: {note}"

        messages = [{"role": "user", "content": user_content}]

        try:
            raw_reply = self.provider.generate_completion(
                messages=messages,
                system_prompt=prompt,
                temperature=0.4,
                max_tokens=150,
            )
        except Exception as err:
            logger.warning(f"AI mood message generation failed: {err}")
            return "Thank you for checking in today. Be gentle with yourself and take things one step at a time."

        mod_result = screen_ai_reply(raw_reply)
        if not mod_result.is_safe:
            return "Thank you for checking in today. Be gentle with yourself and take things one step at a time."

        return _clean_think_tags(raw_reply)

    def generate_journal_reflection(self, title: Optional[str], content: str, mood_tag: Optional[str] = None) -> str:
        """
        Generates a 2-3 sentence empathetic AI reflection for a user's journal entry.
        """
        system_prompt = "You are Kintsugi's CBT-informed journal companion. Provide a brief, supportive, insightful 2-3 sentence reflection validating the user's feelings and highlighting self-compassion or perspective."
        user_msg = f"Journal Title: {title or 'Untitled'}\nContent: {content}"
        if mood_tag:
            user_msg += f"\nMood Tag: {mood_tag}"

        try:
            raw_reply = self.provider.generate_completion(
                messages=[{"role": "user", "content": user_msg}],
                system_prompt=system_prompt,
                temperature=0.5,
                max_tokens=180,
            )
            mod_result = screen_ai_reply(raw_reply)
            if not mod_result.is_safe:
                return "Your reflection shows real self-awareness. Keep exploring your thoughts — every entry brings you closer to understanding yourself."
            return _clean_think_tags(raw_reply)
        except Exception as err:
            logger.warning(f"Failed to generate journal AI reflection: {err}")
            return "Your reflection shows real self-awareness. Keep exploring your thoughts — every entry brings you closer to understanding yourself."

    def generate_journal_prompt(self, category: str = "daily") -> Dict[str, str]:
        """
        Generates a CBT-informed journaling prompt and reflection starter.
        """
        prompts = {
            "daily": {
                "title": "Daily Mindful Reflection",
                "content": "What was one small moment today that brought a feeling of ease or quiet peace? Describe where you were, what you felt, and why it mattered to you.",
            },
            "gratitude": {
                "title": "Evening Gratitude & Growth",
                "content": "Write down 3 things you are grateful for today:\n1. A person or interaction that comforted you:\n2. A challenge you navigated with resilience:\n3. A moment of beauty or simple joy:",
            },
            "cbt": {
                "title": "Cognitive Reframing & Thought Exploration",
                "content": "Identify a thought or worry that has been occupying your mind. Ask yourself:\n• What evidence supports this thought?\n• What evidence challenges it?\n• What is a compassionate, balanced way to view this situation?",
            },
            "mood": {
                "title": "Emotional Check-In & Self-Compassion",
                "content": "If your current mood had a shape, color, or weather pattern, how would you describe it? Allow yourself to write without judgment about what this emotion is trying to tell you.",
            },
        }
        return prompts.get(category.lower(), prompts["daily"])

    def generate_ai_quote(self) -> Dict[str, str]:
        """
        Generates an inspiring, serene daily quote and author attribution using the AI provider.
        """
        system_prompt = "You are Kintsugi's AI Motivational Guide. Generate one inspiring, short daily quote about self-compassion, resilience, or hope. Return output formatted exactly as: 'Quote text' — Author Name"
        messages = [{"role": "user", "content": "Generate a new inspirational quote for today."}]
        try:
            raw_reply = self.provider.generate_completion(
                messages=messages,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=80,
            )
            text = raw_reply.strip().strip('"')
            parts = text.split(" — ")
            return {
                "text": parts[0].strip(),
                "author": parts[1].strip() if len(parts) > 1 else "Kintsugi Wisdom",
                "category": "hope"
            }
        except Exception:
            return {
                "text": "The wound is the place where the Light enters you.",
                "author": "Rumi",
                "category": "hope"
            }

    def generate_ai_affirmations(self, count: int = 5) -> List[Dict[str, str]]:
        """
        Generates a list of empowering daily affirmations using the AI provider.
        """
        system_prompt = f"You are Kintsugi's AI Mental Health Companion. Generate {count} short, empowering daily affirmations written in first-person ('I am...', 'I give myself...', 'I choose...'). Return one affirmation per line with no numbers or bullet points."
        messages = [{"role": "user", "content": "Generate today's daily affirmations."}]
        try:
            raw_reply = self.provider.generate_completion(
                messages=messages,
                system_prompt=system_prompt,
                temperature=0.6,
                max_tokens=250,
            )
            lines = [line.strip().lstrip('•-0123456789. ').strip('"') for line in raw_reply.strip().split('\n') if line.strip()]
            categories = ["resilience", "growth", "self-compassion", "self-awareness", "mindfulness"]
            return [
                {"text": line, "category": categories[idx % len(categories)]}
                for idx, line in enumerate(lines[:count])
            ]
        except Exception:
            return [
                {"text": "Like Kintsugi, my scars and struggles make me stronger, unique, and resilient.", "category": "resilience"},
                {"text": "I am growing and evolving every single day, one step at a time.", "category": "growth"},
                {"text": "I give myself permission to rest and recharge without any guilt.", "category": "self-compassion"},
                {"text": "My feelings are valid, and I honor my personal emotional journey.", "category": "self-awareness"},
                {"text": "I choose to focus on what I can control and release what I cannot.", "category": "mindfulness"},
            ]

    def generate_ai_self_care_tips(self, count: int = 5) -> List[Dict[str, str]]:
        """
        Generates actionable, mindful self-care tips using the AI provider.
        """
        system_prompt = f"You are Kintsugi's Self-Care Assistant. Generate {count} short, actionable self-care practices (1-2 sentences each). Return one tip per line with no numbers or bullet points."
        messages = [{"role": "user", "content": "Generate today's self-care tips."}]
        try:
            raw_reply = self.provider.generate_completion(
                messages=messages,
                system_prompt=system_prompt,
                temperature=0.5,
                max_tokens=250,
            )
            lines = [line.strip().lstrip('•-0123456789. ').strip('"') for line in raw_reply.strip().split('\n') if line.strip()]
            categories = ["mindfulness", "wellness", "activity", "gratitude", "rest"]
            return [
                {"text": line, "category": categories[idx % len(categories)]}
                for idx, line in enumerate(lines[:count])
            ]
        except Exception:
            return [
                {"text": "Pause, inhale, exhale. Reset your mind and body with 5 slow deep breaths.", "category": "mindfulness"},
                {"text": "Hydration is self-care. Drink a fresh glass of water right now.", "category": "wellness"},
                {"text": "A little movement can lift your mood and clear your mind. Go for a short walk.", "category": "activity"},
                {"text": "Focus on what's good. Write down three small things you are grateful for today.", "category": "gratitude"},
                {"text": "Unplug for 15 minutes. Step away from digital screens and rest your eyes.", "category": "rest"},
            ]

    def generate_full_daily_bundle(self) -> Dict[str, Any]:
        """
        Generates a complete, cohesive daily motivation bundle (Quote, Affirmations, Self-Care Tips)
        in a single AI request for high-efficiency daily content creation.
        """
        import re
        import random
        from datetime import datetime, timezone

        system_prompt = """You are Kintsugi's AI Mental Health & Mindfulness Guide.
Generate today's complete, original daily motivation package:
1. Create a fresh, unique, inspiring quote for today about self-compassion, inner healing, resilience, or mindful presence.
CRITICAL: Do NOT use overused quotes like Rumi's "The wound is the place where the Light enters you". Generate a unique, uplifting quote!
Format: QUOTE: [quote text] — [Author Name or Kintsugi Guide]
2. Five empowering first-person affirmations ('I am...', 'I choose...', 'I give myself...').
Format each line as: AFFIRMATION: [text]
3. Five actionable, comforting self-care tips.
Format each line as: TIP: [text]"""
        messages = [{"role": "user", "content": "Generate today's fresh daily motivation package."}]
        try:
            raw_reply = self.provider.generate_completion(
                messages=messages,
                system_prompt=system_prompt,
                temperature=0.75,
                max_tokens=600,
            )
            raw_reply = _clean_think_tags(raw_reply)

            quote_dict = None
            affirmations = []
            tips = []
            aff_categories = ["resilience", "growth", "self-compassion", "self-awareness", "mindfulness"]
            tip_categories = ["mindfulness", "wellness", "activity", "gratitude", "rest"]

            for line in raw_reply.strip().split('\n'):
                line = line.strip()
                clean_line = re.sub(r'^[0-9\.\*\-\s•]+', '', line).strip()
                
                if re.match(r'^(?:QUOTE|Quote):', clean_line, re.IGNORECASE):
                    content = re.sub(r'^(?:QUOTE|Quote):\s*', '', clean_line, flags=re.IGNORECASE).strip().strip('*"\': ')
                    parts = re.split(r'\s+[—–-]\s+', content, maxsplit=1)
                    q_text = parts[0].strip().strip('*"\': ')
                    q_author = parts[1].strip().strip('*"\': ') if len(parts) > 1 else "Kintsugi AI"
                    if "wound is the place" not in q_text.lower():
                        quote_dict = {
                            "text": q_text,
                            "author": q_author,
                            "category": "hope",
                        }
                elif re.match(r'^(?:AFFIRMATION|Affirmation):', clean_line, re.IGNORECASE):
                    clean = re.sub(r'^(?:AFFIRMATION|Affirmation):\s*', '', clean_line, flags=re.IGNORECASE).strip().strip('*"\':-• ')
                    if clean:
                        category = aff_categories[len(affirmations) % len(aff_categories)]
                        affirmations.append({"text": clean, "category": category})
                elif re.match(r'^(?:TIP|Tip):', clean_line, re.IGNORECASE):
                    clean = re.sub(r'^(?:TIP|Tip):\s*', '', clean_line, flags=re.IGNORECASE).strip().strip('*"\':-• ')
                    if clean:
                        category = tip_categories[len(tips) % len(tip_categories)]
                        tips.append({"text": clean, "category": category})

            # Dynamic Inspirational Quotes Pool for rotation if AI omitted quote or returned static fallback
            dynamic_quotes = [
                {"text": "Gold is revealed not before the fire, but through the mending of what was broken.", "author": "Kintsugi Wisdom", "category": "resilience"},
                {"text": "Peace is not the absence of storms, but the quiet presence of compassion within.", "author": "Mindful Guide", "category": "mindfulness"},
                {"text": "You do not have to carry tomorrow's burdens while taking today's steps.", "author": "Gentle Reminder", "category": "self-compassion"},
                {"text": "Every small act of self-care is a declaration that your well-being matters.", "author": "Kintsugi AI", "category": "growth"},
                {"text": "Healing is not linear; give yourself the patience you so generously offer others.", "author": "Inner Light", "category": "hope"},
                {"text": "Softness is not weakness; it is the courage to remain open in a heavy world.", "author": "Serene Reflections", "category": "resilience"},
            ]
            
            day_idx = datetime.now(timezone.utc).timetuple().tm_yday
            if not quote_dict:
                quote_dict = dynamic_quotes[day_idx % len(dynamic_quotes)]

            if not affirmations:
                affirmations = self.generate_ai_affirmations(5)
            if not tips:
                tips = self.generate_ai_self_care_tips(5)

            return {
                "quote": quote_dict["text"],
                "quote_author": quote_dict["author"],
                "quote_category": quote_dict.get("category", "hope"),
                "affirmations": affirmations,
                "self_care_tips": tips,
            }
        except Exception as err:
            logger.warning(f"AI full daily bundle generation failed, using structured fallback: {err}")
            day_idx = datetime.now(timezone.utc).timetuple().tm_yday
            fallback_quotes = [
                {"text": "Gold is revealed not before the fire, but through the mending of what was broken.", "author": "Kintsugi Wisdom", "category": "resilience"},
                {"text": "Peace is not the absence of storms, but the quiet presence of compassion within.", "author": "Mindful Guide", "category": "mindfulness"},
                {"text": "You do not have to carry tomorrow's burdens while taking today's steps.", "author": "Gentle Reminder", "category": "self-compassion"},
            ]
            q = fallback_quotes[day_idx % len(fallback_quotes)]
            return {
                "quote": q["text"],
                "quote_author": q["author"],
                "quote_category": q["category"],
                "affirmations": self.generate_ai_affirmations(5),
                "self_care_tips": self.generate_ai_self_care_tips(5),
            }


ai_service = AIService()
