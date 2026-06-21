"""Resolve the active AI provider from settings."""
from __future__ import annotations

import logging
from functools import lru_cache

from django.conf import settings

from .base import AIProvider
from .gapgpt import GapGPTProvider
from .stub import StubProvider

logger = logging.getLogger(__name__)

_PROVIDERS: dict[str, type[AIProvider]] = {
    "gapgpt": GapGPTProvider,
    "stub": StubProvider,
    # "openai": OpenAIProvider,      # future
    # "anthropic": AnthropicProvider,
    # "gemini": GeminiProvider,
}


@lru_cache(maxsize=None)
def get_provider() -> AIProvider:
    """Return a singleton instance of the configured provider.

    Falls back to the offline stub when GapGPT is selected but no API key is
    configured, so local development works without credentials.
    """
    key = (settings.AI_PROVIDER or "gapgpt").lower()

    if key == "gapgpt" and not settings.GAPGPT_API_KEY:
        logger.warning("GAPGPT_API_KEY not set — using the offline stub AI provider.")
        key = "stub"

    try:
        provider_cls = _PROVIDERS[key]
    except KeyError as exc:
        raise ValueError(
            f"Unknown AI_PROVIDER {key!r}. Available: {sorted(_PROVIDERS)}"
        ) from exc
    return provider_cls()
