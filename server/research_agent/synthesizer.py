"""Synthesis stage: combine raw research into structured analysis.

Uses GPT-5.1 **without** web search (pure reasoning) so it is faster and
avoids the known JSON-corruption bug with ``web_search_preview`` +
structured outputs.
"""

from __future__ import annotations

import asyncio
import json
import re

from openai import AsyncOpenAI

from .config import AgentConfig, DEFAULT_CONFIG
from .prompts import SYNTHESIS_NO_MAIN_EVENT_PROMPT, SYNTHESIS_PROMPT
from .researcher import RawResearchResult
from .schemas import MainEvent, SubEvent


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


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


def _strip_markdown_fences(raw_text: str) -> str:
    """Strip markdown code fences if the model wraps JSON in them."""
    if raw_text.startswith("```"):
        raw_text = raw_text.split("\n", 1)[1] if "\n" in raw_text else raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()
    return raw_text


def _parse_json_from_text(raw_text: str) -> dict:
    """Parse JSON from model output, tolerating wrappers around the JSON object."""
    stripped = _strip_markdown_fences(raw_text).strip()
    try:
        parsed = json.loads(stripped)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", stripped, re.DOTALL)
    if not match:
        raise json.JSONDecodeError("No JSON object found", stripped, 0)

    parsed = json.loads(match.group(0))
    return parsed if isinstance(parsed, dict) else {}


def _normalize_synthesis_payload(
    payload: dict,
    sub_events: list[SubEvent],
    has_main_event: bool,
) -> dict:
    """Normalize model output into the shape expected by the orchestrator."""
    normalized = dict(payload)

    sub_analyses = normalized.get("sub_event_analyses")
    if not isinstance(sub_analyses, list):
        alt = normalized.get("sub_event_research")
        if isinstance(alt, list):
            sub_analyses = alt
        else:
            sub_analyses = []

    valid_sub_analyses = [item for item in sub_analyses if isinstance(item, dict)]
    by_id: dict[str, dict] = {}
    for item in valid_sub_analyses:
        sid = str(item.get("sub_event_id", "")).strip()
        if sid:
            by_id[sid] = item

    completed_sub_analyses: list[dict] = []
    for sub_event in sub_events:
        source = by_id.get(sub_event.id, {})
        completed_sub_analyses.append(
            {
                "sub_event_id": source.get("sub_event_id", sub_event.id),
                "sub_event_title": source.get("sub_event_title", sub_event.title),
                "summary": source.get("summary", ""),
                "key_findings": source.get("key_findings", []),
                "sentiment": source.get("sentiment", "neutral"),
                "sentiment_rationale": source.get("sentiment_rationale", ""),
            }
        )

    normalized["sub_event_analyses"] = completed_sub_analyses

    if has_main_event:
        main_event_research = normalized.get("main_event_research")
        if not isinstance(main_event_research, dict):
            main_event_research = {}
        normalized["main_event_research"] = {
            "summary": main_event_research.get("summary", ""),
            "key_findings": main_event_research.get("key_findings", []),
            "sentiment": main_event_research.get("sentiment", "neutral"),
            "sentiment_rationale": main_event_research.get("sentiment_rationale", ""),
        }

        relationships = normalized.get("relationships")
        if not isinstance(relationships, list):
            relationships = []
        valid_relationships = [item for item in relationships if isinstance(item, dict)]
        rel_by_id: dict[str, dict] = {}
        for rel in valid_relationships:
            sid = str(rel.get("sub_event_id", "")).strip()
            if sid:
                rel_by_id[sid] = rel

        completed_relationships: list[dict] = []
        for sub_event in sub_events:
            rel = rel_by_id.get(sub_event.id, {})
            completed_relationships.append(
                {
                    "sub_event_id": rel.get("sub_event_id", sub_event.id),
                    "sub_event_title": rel.get("sub_event_title", sub_event.title),
                    "relationship_summary": rel.get("relationship_summary", ""),
                    "influencing_news": rel.get("influencing_news", ""),
                }
            )
        normalized["relationships"] = completed_relationships

    synthesis = normalized.get("synthesis", "")
    normalized["synthesis"] = synthesis if isinstance(synthesis, str) else str(synthesis)
    return normalized


async def _run_synthesis_completion(
    client: AsyncOpenAI,
    prompt: str,
    config: AgentConfig,
) -> str:
    """Run synthesis via Responses API when available, else Chat Completions."""
    system_msg = (
        "You are a JSON-only response bot. "
        "Return ONLY valid JSON, no markdown fences, "
        "no explanation outside the JSON object."
    )

    if hasattr(client, "responses"):
        response = await client.responses.create(
            model=config.model,
            input=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
        )
        return response.output_text.strip()

    try:
        response = await client.chat.completions.create(
            model=config.model,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
    except Exception:
        response = await client.chat.completions.create(
            model=config.model,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
        )

    return _extract_chat_text(response).strip()


def _build_sub_events_block(
    sub_events: list[SubEvent],
    sub_event_results: list[RawResearchResult],
) -> str:
    """Build the text block describing all sub-event research for the prompt."""

    result_map = {r.event_id: r for r in sub_event_results}
    blocks: list[str] = []

    for se in sub_events:
        result = result_map.get(se.id)
        block = f"\n--- SUB-EVENT: {se.title} ---\nID: {se.id}\n"

        if result and result.error is None:
            block += f"Research Findings:\n{result.research_text}\n"
        elif result and result.error:
            block += f"Research Error: {result.error}\n"
        else:
            block += "No research available.\n"

        blocks.append(block)

    return "\n".join(blocks)


# ---------------------------------------------------------------------------
# Main synthesis function
# ---------------------------------------------------------------------------


async def synthesize(
    client: AsyncOpenAI,
    main_event: MainEvent | None,
    sub_events: list[SubEvent],
    main_event_result: RawResearchResult | None,
    sub_event_results: list[RawResearchResult],
    config: AgentConfig = DEFAULT_CONFIG,
) -> dict:
    """Synthesise all research into a structured analysis dict.

    Returns a ``dict`` that the orchestrator maps onto the output Pydantic
    models.  Falls back to a minimal structure if the LLM call fails.
    """

    sub_events_block = _build_sub_events_block(sub_events, sub_event_results)

    if main_event is not None:
        # Build main-event research block
        if main_event_result and main_event_result.error is None:
            main_research_block = main_event_result.research_text
        elif main_event_result and main_event_result.error:
            main_research_block = f"Research Error: {main_event_result.error}"
        else:
            main_research_block = "No main event research available."

        prompt = SYNTHESIS_PROMPT.format(
            main_event_title=main_event.title,
            main_event_description=main_event.description or "",
            main_event_research_block=main_research_block,
            sub_events_research_block=sub_events_block,
        )
    else:
        prompt = SYNTHESIS_NO_MAIN_EVENT_PROMPT.format(
            sub_events_research_block=sub_events_block,
        )

    try:
        raw_text = await asyncio.wait_for(
            _run_synthesis_completion(client, prompt, config),
            timeout=config.synthesis_timeout,
        )
        parsed = _parse_json_from_text(raw_text)
        return _normalize_synthesis_payload(
            payload=parsed,
            sub_events=sub_events,
            has_main_event=main_event is not None,
        )

    except (asyncio.TimeoutError, json.JSONDecodeError, Exception) as exc:
        return _build_fallback(
            main_event,
            sub_events,
            main_event_result,
            sub_event_results,
            str(exc),
        )


# ---------------------------------------------------------------------------
# Fallback if synthesis LLM call fails
# ---------------------------------------------------------------------------


def _build_fallback(
    main_event: MainEvent | None,
    sub_events: list[SubEvent],
    main_event_result: RawResearchResult | None,
    sub_event_results: list[RawResearchResult],
    error_msg: str,
) -> dict:
    """Return a minimal valid synthesis dict from raw research text."""

    result_map = {r.event_id: r for r in sub_event_results}

    sub_analyses = []
    for se in sub_events:
        r = result_map.get(se.id)
        sub_analyses.append(
            {
                "sub_event_id": se.id,
                "sub_event_title": se.title,
                "summary": (
                    r.research_text[:3000]
                    if r and not r.error
                    else f"Research unavailable: {r.error if r else 'unknown'}"
                ),
                "key_findings": ["See raw research text above"],
                "sentiment": "neutral",
                "sentiment_rationale": "Automated fallback – synthesis LLM call failed",
            }
        )

    result: dict = {
        "sub_event_analyses": sub_analyses,
        "synthesis": (
            f"Synthesis failed ({error_msg}). "
            "Raw research is included per sub-event above."
        ),
    }

    if main_event:
        result["main_event_research"] = {
            "summary": (
                main_event_result.research_text[:3000]
                if main_event_result and not main_event_result.error
                else (
                    f"Research unavailable: {main_event_result.error}"
                    if main_event_result
                    else "Research unavailable: main event research was not collected."
                )
            ),
            "key_findings": ["See raw research text"],
            "sentiment": "neutral",
            "sentiment_rationale": "Automated fallback",
        }
        result["relationships"] = [
            {
                "sub_event_id": se.id,
                "sub_event_title": se.title,
                "relationship_summary": "Relationship analysis unavailable in fallback mode.",
                "influencing_news": "No additional relationship-specific influencing news was generated.",
            }
            for se in sub_events
        ]

    return result
