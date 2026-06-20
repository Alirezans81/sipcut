"""Resolve the active AI provider from settings."""
from __future__ import annotations

from functools import lru_cache

from django.conf import settings

from .base import AIProvider
from .gapgpt import GapGPTProvider

_PROVIDERS: dict[str, type[AIProvider]] = {
    "gapgpt": GapGPTProvider,
    # "openai": OpenAIProvider,      # future
    # "anthropic": AnthropicProvider,
    # "gemini": GeminiProvider,
}


@lru_cache(maxsize=None)
def get_provider() -> AIProvider:
    """Return a singleton instance of the configured provider."""
    key = (settings.AI_PROVIDER or "gapgpt").lower()
    try:
        provider_cls = _PROVIDERS[key]
    except KeyError as exc:
        raise ValueError(
            f"Unknown AI_PROVIDER {key!r}. Available: {sorted(_PROVIDERS)}"
        ) from exc
    return provider_cls()
