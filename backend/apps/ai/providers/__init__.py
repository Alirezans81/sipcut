"""AI provider abstraction.

The application must never depend directly on a single provider (see
docs/ARCHITECTURE.md — AI Layer). All callers resolve a provider through
``get_provider()`` and program against the :class:`AIProvider` interface.
"""
from .base import AIProvider
from .factory import get_provider

__all__ = ("AIProvider", "get_provider")
