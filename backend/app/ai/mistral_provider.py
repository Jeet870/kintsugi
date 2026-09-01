"""
Mistral AI Provider Implementation.
Concrete adapter implementing the AIProvider interface using MistralClient.
"""
from typing import List, Dict, Optional
from app.ai.base import AIProvider
from app.ai.mistral_client import mistral_client, MistralClient


class MistralProvider(AIProvider):
    """
    Mistral AI Provider implementation delegating to MistralClient API client.
    """
    def __init__(self, client: Optional[MistralClient] = None):
        self.client = client or mistral_client

    def generate_completion(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generates text completion using Mistral API client.
        """
        return self.client.generate_chat_response_sync(
            messages=messages,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )


default_mistral_provider = MistralProvider()
