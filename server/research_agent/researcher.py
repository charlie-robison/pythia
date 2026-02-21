"""Individual event research using GPT-5.1 with web_search_preview.

Each public function performs a single research task and returns a
``RawResearchResult`` containing the full research text plus extracted
source links.
"""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field
from typing import Callable, Coroutine

from openai import AsyncOpenAI

from .config import AgentConfig, DEFAULT_CONFIG
from .prompts import MAIN_EVENT_RESEARCH_PROMPT, SUB_EVENT_RESEARCH_PROMPT
from .schemas import MainEvent, NewsLink, SubEvent


# ---------------------------------------------------------------------------
# Data container for a single research call's output
# ---------------------------------------------------------------------------


@dataclass
class RawResearchResult:
    """Raw output from a single web-search research call."""

    event_id: str
    event_title: str
    research_text: str  # Full text from GPT with inline citations
    news_links: list[NewsLink] = field(default_factory=list)
    is_main_event: bool = False
    error: str | None = None


# ---------------------------------------------------------------------------
# Citation extraction helpers
# ---------------------------------------------------------------------------


def _extract_news_links(response: object) -> list[NewsLink]:
    """Extract ``NewsLink`` objects from OpenAI response annotations.

    The Responses API returns output items; ``message`` items contain
    ``content`` blocks that may carry ``url_citation`` annotations.
    """
    links: list[NewsLink] = []
    seen_urls: set[str] = set()

    for item in response.output:  # type: ignore[attr-defined]
        if getattr(item, "type", None) != "message":
            continue
        for block in getattr(item, "content", []):
            for annotation in getattr(block, "annotations", []):
                url = getattr(annotation, "url", None)
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    links.append(
                        NewsLink(
                            title=getattr(annotation, "title", "") or "",
                            url=url,
                        )
                    )
    return links


def _extract_chat_text(response: object) -> str:
    """Extract plain text from Chat Completions responses."""
    choices = getattr(response, "choices", None)
    if not choices:
        return ""
    message = getattr(choices[0], "message", None)
    content = getattr(message, "content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        chunks: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if text:
                    chunks.append(str(text))
            else:
                text = getattr(item, "text", None)
                if text:
                    chunks.append(str(text))
        return "\n".join(chunks)
    return str(content)


def _extract_links_from_text(text: str) -> list[NewsLink]:
    """Best-effort URL extraction for Chat Completions fallback."""
    links: list[NewsLink] = []
    seen_urls: set[str] = set()
    for match in re.finditer(r"https?://[^\s\])\"'>]+", text):
        url = match.group(0).rstrip(".,;:")
        if url in seen_urls:
            continue
        seen_urls.add(url)
        links.append(NewsLink(title=url, url=url))
    return links


async def _run_research_completion(
    client: AsyncOpenAI,
    prompt: str,
    config: AgentConfig,
) -> tuple[str, list[NewsLink]]:
    """Run research using Responses API when available, else Chat Completions."""
    if hasattr(client, "responses"):
        response = await client.responses.create(
            model=config.model,
            tools=[
                {
                    "type": "web_search_preview",
                    "search_context_size": config.search_context_size,
                }
            ],
            input=prompt,
        )
        return response.output_text, _extract_news_links(response)

    chat_response = await client.chat.completions.create(
        model=config.model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a research assistant. "
                    "Provide concise factual analysis and include source URLs "
                    "inline when possible."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    )
    text = _extract_chat_text(chat_response).strip()
    return text, _extract_links_from_text(text)


# ---------------------------------------------------------------------------
# Research functions
# ---------------------------------------------------------------------------


async def research_main_event(
    client: AsyncOpenAI,
    event: MainEvent,
    config: AgentConfig = DEFAULT_CONFIG,
) -> RawResearchResult:
    """Research a main event using agentic web search."""

    prompt = MAIN_EVENT_RESEARCH_PROMPT.format(
        title=event.title,
        description=event.description or "No additional description provided.",
    )

    try:
        research_text, news_links = await asyncio.wait_for(
            _run_research_completion(client, prompt, config),
            timeout=config.per_research_timeout,
        )

        return RawResearchResult(
            event_id="main",
            event_title=event.title,
            research_text=research_text,
            news_links=news_links[: config.max_news_links_per_event],
            is_main_event=True,
        )

    except asyncio.TimeoutError:
        return RawResearchResult(
            event_id="main",
            event_title=event.title,
            research_text="",
            is_main_event=True,
            error=f"Research timed out after {config.per_research_timeout}s",
        )
    except Exception as exc:
        return RawResearchResult(
            event_id="main",
            event_title=event.title,
            research_text="",
            is_main_event=True,
            error=f"Research failed: {exc}",
        )


async def research_sub_event(
    client: AsyncOpenAI,
    sub_event: SubEvent,
    config: AgentConfig = DEFAULT_CONFIG,
) -> RawResearchResult:
    """Research a single sub-event / market question using agentic web search."""

    prompt = SUB_EVENT_RESEARCH_PROMPT.format(
        title=sub_event.title,
        description=sub_event.description or "No additional description provided.",
    )

    try:
        research_text, news_links = await asyncio.wait_for(
            _run_research_completion(client, prompt, config),
            timeout=config.per_research_timeout,
        )

        return RawResearchResult(
            event_id=sub_event.id,
            event_title=sub_event.title,
            research_text=research_text,
            news_links=news_links[: config.max_news_links_per_event],
            is_main_event=False,
        )

    except asyncio.TimeoutError:
        return RawResearchResult(
            event_id=sub_event.id,
            event_title=sub_event.title,
            research_text="",
            is_main_event=False,
            error=f"Research timed out after {config.per_research_timeout}s",
        )
    except Exception as exc:
        return RawResearchResult(
            event_id=sub_event.id,
            event_title=sub_event.title,
            research_text="",
            is_main_event=False,
            error=f"Research failed: {exc}",
        )


# ---------------------------------------------------------------------------
# Retry wrapper
# ---------------------------------------------------------------------------


async def research_with_retry(
    coro_factory: Callable[[], Coroutine[None, None, RawResearchResult]],
    config: AgentConfig = DEFAULT_CONFIG,
) -> RawResearchResult:
    """Retry a research call up to ``config.max_retries`` times on failure."""

    last_result: RawResearchResult | None = None
    for attempt in range(1 + config.max_retries):
        result = await coro_factory()
        if result.error is None:
            return result
        last_result = result
        if attempt < config.max_retries:
            await asyncio.sleep(config.retry_delay)
    return last_result  # type: ignore[return-value]
