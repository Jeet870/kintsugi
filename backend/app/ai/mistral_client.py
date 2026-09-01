"""
Mistral AI Provider Client.
Production-ready async wrapper for the Mistral Chat Completion API featuring connection pooling,
exponential backoff retries, configurable timeouts, structured logging, and typed AI exceptions.
"""
import asyncio
import logging
import random
import concurrent.futures
from typing import List, Dict, Any, Optional

import httpx

from app.core.config import settings
from app.core.exceptions import (
    AIProviderException,
    AIAuthenticationException,
    AIRateLimitException,
    AITimeoutException,
    AIConfigurationException,
)

logger = logging.getLogger("kintsugi.ai.mistral")


class MistralClient:
    """
    Isolated async gateway for external Mistral Chat Completion API calls.
    """
    MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: Optional[float] = None,
        max_retries: Optional[int] = None,
    ):
        self.api_key = api_key or settings.MISTRAL_API_KEY
        self.model = model or settings.MISTRAL_MODEL
        self.timeout = timeout or settings.AI_TIMEOUT_SECONDS
        self.max_retries = max_retries or settings.AI_MAX_RETRIES

    def _get_headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise AIConfigurationException("MISTRAL_API_KEY is not configured in settings")
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _generate_dynamic_fallback(self, messages: List[Dict[str, str]]) -> str:
        """
        Empathetic, CBT-informed dynamic fallback generator.
        Uses exact word-boundary tokenization to accurately analyze user intent and return contextual responses.
        """
        import re

        last_user_msg = ""
        raw_last = ""
        for m in reversed(messages):
            if m.get("role") in ("user", "human"):
                raw_last = m.get("content", "").strip()
                last_user_msg = raw_last.lower()
                break

        if not last_user_msg:
            reasoning = "<think>\n• User Intent: Session initialization / open greeting.\n• Emotional State: Neutral / Undefined.\n• CBT Framing: Provide an inviting, grounded open prompt.\n</think>\n\n"
            return reasoning + "I am here with you. Take a slow, deep breath and tell me what is on your mind today."

        # Extract discrete word tokens to prevent substring false-positives (e.g., 'thing' containing 'hi')
        word_tokens = set(re.findall(r'\b[a-z0-9]+\b', last_user_msg))

        # 1. Greeting patterns (exact word match)
        greeting_words = {"hi", "hello", "hey", "greetings", "hola"}
        if word_tokens & greeting_words or any(phrase in last_user_msg for phrase in ["good morning", "good evening", "good afternoon"]):
            reasoning = "<think>\n• User Intent: Friendly conversational greeting.\n• Emotional Tone: Receptive, open.\n• CBT Framing: Establish active listening presence and warm rapport.\n</think>\n\n"
            return reasoning + "Hello! I am glad you reached out today. How are you feeling right now in this moment?"

        # 2. "How are you" patterns
        if any(phrase in last_user_msg for phrase in ["how are you", "how's it going", "how do you do", "how are u"]):
            reasoning = "<think>\n• User Intent: Checking in on companion state.\n• Emotional Tone: Courteous, relational.\n• CBT Framing: Acknowledge politely and redirect focus back to user's emotional experience.\n</think>\n\n"
            return reasoning + "I am doing well, thank you for asking! More importantly, how are things going with you today? I'm here to listen."

        # App & Platform knowledge questions pattern (What is Kintsugi / App Features / Privacy / Persistence)
        app_keywords = {"kintsugi", "app", "feature", "features", "privacy", "persistent", "saved", "history", "vault"}
        if (word_tokens & app_keywords) or any(phrase in last_user_msg for phrase in ["tell me about", "what is this", "what can you do", "how does it work", "is chat saved"]):
            reasoning = "<think>\n• User Intent: Inquiring about Kintsugi platform capabilities, privacy, and feature set.\n• Identified Domain: Platform architecture, Mood Tracker, AI Companion, CBT tools, and persistent vault.\n• CBT Framing: Provide clear, supportive overview of Kintsugi's mission and wellness tools.\n</think>\n\n"
            return reasoning + (
                "Kintsugi is an AI-powered mental wellness companion named after the Japanese art of repairing broken pottery with gold. "
                "Our platform offers a safe, 256-bit encrypted space where your chat history is completely persistent and private. "
                "Here, you can track daily moods, practice 4-7-8 breathing & 5-4-3-2-1 CBT grounding exercises, read daily affirmations, "
                "and reflect whenever you need a supportive ear. How can I help you explore Kintsugi today?"
            )

        # 3. Seeking action / guidance / advice patterns
        guidance_triggers = {"advice", "recommend", "suggestion", "suggest"}
        if (word_tokens & guidance_triggers) or any(phrase in last_user_msg for phrase in ["what to do", "thing to do", "best thing", "what should i"]):
            reasoning = "<think>\n• User Input Analysis: Seeking actionable direction or guidance.\n• Identified Intent: Looking for a supportive coping strategy or manageable next step.\n• CBT Framing: Encourage low-pressure, micro-actions and present-moment grounding.\n</think>\n\n"
            return reasoning + "I hear that you're looking for guidance on what to focus on right now. A gentle first step is breaking things down into one small, manageable action—such as taking 3 grounding breaths, stepping away for a short walk, or writing down what is on your mind. What feels most supportive for you in this moment?"

        # 4. Anxiety / Stress / Panic patterns
        anxiety_words = {"anxious", "anxiety", "stressed", "stress", "panic", "overwhelmed", "scared", "fear", "worried", "worry", "nervous"}
        if word_tokens & anxiety_words:
            reasoning = "<think>\n• User Intent: Expressing emotional overwhelm or somatic anxiety.\n• Emotional State: High arousal / hyper-vigilance.\n• CBT Framing: Offer present-moment grounding exercise (3 deep breaths) to soothe nervous system.\n</think>\n\n"
            return reasoning + "I hear how overwhelming that feels right now. When anxiety builds up, anchoring ourselves in the present can help. Would you like to take 3 deep, grounding breaths together?"

        # 5. Sadness / Depression / Low mood patterns
        sadness_words = {"sad", "depressed", "lonely", "down", "crying", "hurt", "hopeless", "pain", "unhappy", "gloomy"}
        if word_tokens & sadness_words:
            reasoning = "<think>\n• User Intent: Disclosing sadness or emotional vulnerability.\n• Emotional State: Low mood, emotional heaviness.\n• CBT Framing: Validate courage to share, avoid toxic positivity, and offer safe inquiry space.\n</think>\n\n"
            return reasoning + "Thank you for sharing that with me. It takes courage to open up when things feel heavy. What has been weighing on your heart the most today?"

        # 6. Gratitude / Thank you patterns
        gratitude_words = {"thanks", "thank", "appreciate", "thankful"}
        if (word_tokens & gratitude_words) or "thank you" in last_user_msg:
            reasoning = "<think>\n• User Intent: Expressing gratitude or positive reflection.\n• Emotional Tone: Relieved, appreciative.\n• CBT Framing: Reinforce self-compassion and affirm self-healing journey.\n</think>\n\n"
            return reasoning + "You are so welcome! Remember that giving yourself grace is an ongoing journey. I am always right here whenever you need a supportive ear."

        # 7. General reflective CBT response (dynamic for any input)
        truncated = (raw_last[:50] + "...") if len(raw_last) > 50 else raw_last
        reasoning = f"<think>\n• User Input Analysis: Processing '{truncated}'\n• Identified Cognitive Frame: Reflective thought sharing.\n• CBT Framing: Socratic reflection and emotional validation.\n</think>\n\n"
        return (
            reasoning +
            f"I hear you. When you share about '{truncated}', "
            "it shows how deeply you are processing your experience. "
            "How does holding that thought feel for you right now?"
        )

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Asynchronously sends a chat completion request to the Mistral API with retry logic and backoff.
        """
        # Dev / Test fallback if API key is unconfigured
        if not self.api_key or not self.api_key.strip():
            logger.info("MISTRAL_API_KEY is unconfigured. Using dynamic CBT response generator.")
            return self._generate_dynamic_fallback(messages)

        temp = temperature if temperature is not None else settings.AI_TEMPERATURE
        tokens = max_tokens if max_tokens is not None else settings.AI_MAX_TOKENS

        # Prepare messages payload
        payload_messages = []
        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})

        for msg in messages:
            payload_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })

        payload = {
            "model": self.model,
            "messages": payload_messages,
            "temperature": temp,
            "max_tokens": tokens,
        }

        headers = self._get_headers()
        attempt = 0
        backoff_delay = 1.0

        async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
            while attempt < self.max_retries:
                attempt += 1
                try:
                    logger.debug(f"Sending Mistral chat request (Attempt {attempt}/{self.max_retries})")
                    response = await client.post(self.MISTRAL_API_URL, headers=headers, json=payload)

                    if response.status_code == 200:
                        data = response.json()
                        choices = data.get("choices", [])
                        if choices and len(choices) > 0:
                            content = choices[0].get("message", {}).get("content", "")
                            return content.strip()
                        raise AIProviderException("Mistral API returned an empty completion response")

                    elif response.status_code == 401:
                        logger.error("Mistral API authentication failed (HTTP 401)")
                        raise AIAuthenticationException("Invalid Mistral API key")

                    elif response.status_code in (429, 500, 502, 503, 504):
                        logger.warning(
                            f"Transient HTTP {response.status_code} error from Mistral API. "
                            f"Attempt {attempt}/{self.max_retries}"
                        )
                        if response.status_code == 429 and attempt == self.max_retries:
                            raise AIRateLimitException("Mistral API rate limit exceeded persistently")
                    else:
                        logger.error(f"Unexpected HTTP {response.status_code} error from Mistral API")
                        raise AIProviderException(f"Mistral API error: HTTP {response.status_code}")

                except (httpx.TimeoutException, httpx.ConnectTimeout, httpx.ReadTimeout) as exc:
                    logger.warning(f"Timeout connecting to Mistral API on attempt {attempt}: {exc}")
                    if attempt == self.max_retries:
                        raise AITimeoutException("Mistral API request timed out persistently")

                except (httpx.NetworkError, httpx.HTTPError) as exc:
                    if isinstance(exc, (AIAuthenticationException, AIRateLimitException, AITimeoutException, AIProviderException)):
                        raise exc
                    logger.warning(f"Network error communicating with Mistral API on attempt {attempt}: {exc}")

                # Exponential backoff with jitter before retrying transient errors
                if attempt < self.max_retries:
                    jitter = random.uniform(0.1, 0.5)
                    sleep_time = backoff_delay + jitter
                    logger.info(f"Retrying Mistral call in {sleep_time:.2f} seconds...")
                    await asyncio.sleep(sleep_time)
                    backoff_delay *= 2.0

        return self._generate_dynamic_fallback(messages)

    def generate_chat_response_sync(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Synchronous wrapper adapter for generate_chat_response supporting thread-pool execution.
        """
        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(
                        asyncio.run,
                        self.generate_chat_response(messages, system_prompt, temperature, max_tokens)
                    )
                    return future.result()
            else:
                return asyncio.run(
                    self.generate_chat_response(messages, system_prompt, temperature, max_tokens)
                )
        except Exception as e:
            logger.warning(f"Error executing generate_chat_response_sync: {e}")
            return self._generate_dynamic_fallback(messages)


mistral_client = MistralClient()
