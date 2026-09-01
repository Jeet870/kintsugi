"""
Abstract AI Provider Interface.
Defines vendor-agnostic contract for AI completion providers (Mistral, OpenAI, Gemini, Claude, Ollama).
Enforces Dependency Inversion so business services never depend directly on a specific AI vendor SDK.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional


class AIProvider(ABC):
    """
    Abstract Base Class for AI Completion Providers.
    """
    @abstractmethod
    def generate_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generates text completion response given system prompt and conversation messages payload.
        """
        pass
