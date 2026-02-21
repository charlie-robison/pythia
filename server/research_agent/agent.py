"""ResearchAgent – main orchestrator for the 3-stage research pipeline.

Stage 1: Parallel web research on all events (async, simultaneous)
Stage 2: LLM synthesis of all research (single call, no web search)
Stage 3: Structured output assembly (pure Python)
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import httpx
from openai import AsyncOpenAI

from .config import AgentConfig, DEFAULT_CONFIG
from .researcher import (
    RawResearchResult,
    research_main_event,
    research_sub_event,
    research_with_retry,
)
from .schemas import (
    MainEventResearch,
    ResearchInput,
    ResearchOutput,
    SentimentRating,
    SubEventRelationship,
    SubEventResearch,
)
from .synthesizer import synthesize


def _build_openai_client(api_key: str | None) -> AsyncOpenAI:
    """Create an AsyncOpenAI client with compatibility fallback for httpx/openai version mismatches."""
    try:
        return AsyncOpenAI(api_key=api_key) if api_key else AsyncOpenAI()
    except TypeError as exc:
        if "proxies" not in str(exc):
            raise
        http_client = httpx.AsyncClient()
        return (
            AsyncOpenAI(api_key=api_key, http_client=http_client)
            if api_key
            else AsyncOpenAI(http_client=http_client)
        )


class ResearchAgent:
    """Polymarket Research Agent.

    Usage::

        agent = ResearchAgent()
        result = await agent.run(research_input)
        print(result.model_dump_json(indent=2))
    """

    def __init__(
        self,
        config: AgentConfig = DEFAULT_CONFIG,
        api_key: str | None = None,
    ) -> None:
        self.config = config
        self.client = _build_openai_client(api_key)

    async def run(self, input_data: ResearchInput) -> ResearchOutput:
        """Execute the full research pipeline with a hard timeout."""

        try:
            return await asyncio.wait_for(
                self._run_pipeline(input_data),
                timeout=self.config.total_timeout,
            )
        except asyncio.TimeoutError:
            return ResearchOutput(
                sub_event_research=[],
                synthesis=(
                    "Research pipeline timed out after "
                    f"{self.config.total_timeout}s. Results may be incomplete."
                ),
                research_timestamp=datetime.now(timezone.utc).isoformat(),
            )

    # ------------------------------------------------------------------
    # Internal pipeline
    # ------------------------------------------------------------------

    async def _run_pipeline(self, input_data: ResearchInput) -> ResearchOutput:
        """Run stages 1-3 sequentially (stage 1 is internally parallel)."""

        # ── Stage 1: Parallel Research ──────────────────────────────
        semaphore = asyncio.Semaphore(self.config.max_concurrent_research)
        tasks: list[asyncio.Task[RawResearchResult]] = []

        # Main event
        main_event_task: asyncio.Task[RawResearchResult] | None = None
        if input_data.main_event is not None:
            me = input_data.main_event  # capture for closure

            async def _research_main() -> RawResearchResult:
                async with semaphore:
                    return await research_with_retry(
                        lambda: research_main_event(self.client, me, self.config),
                        self.config,
                    )

            main_event_task = asyncio.create_task(_research_main())
            tasks.append(main_event_task)

        # Sub-events (all launched in parallel)
        sub_event_tasks: list[tuple[str, asyncio.Task[RawResearchResult]]] = []
        for sub_event in input_data.sub_events:
            se = sub_event  # capture for closure

            async def _research_sub(se=se) -> RawResearchResult:
                async with semaphore:
                    return await research_with_retry(
                        lambda se=se: research_sub_event(
                            self.client, se, self.config
                        ),
                        self.config,
                    )

            task = asyncio.create_task(_research_sub())
            sub_event_tasks.append((se.id, task))
            tasks.append(task)

        # Wait for everything
        await asyncio.gather(*tasks, return_exceptions=True)

        # Collect results
        main_event_result: RawResearchResult | None = None
        if main_event_task is not None:
            try:
                main_event_result = main_event_task.result()
            except Exception:
                main_event_result = None

        sub_event_results: list[RawResearchResult] = []
        for se_id, task in sub_event_tasks:
            try:
                sub_event_results.append(task.result())
            except Exception as exc:
                sub_event_results.append(
                    RawResearchResult(
                        event_id=se_id,
                        event_title="Unknown",
                        research_text="",
                        error=f"Task exception: {exc}",
                    )
                )

        # ── Stage 2: Synthesis ──────────────────────────────────────
        synthesis_dict = await synthesize(
            client=self.client,
            main_event=input_data.main_event,
            sub_events=input_data.sub_events,
            main_event_result=main_event_result,
            sub_event_results=sub_event_results,
            config=self.config,
        )

        # ── Stage 3: Assemble structured output ────────────────────
        return self._assemble_output(
            input_data=input_data,
            main_event_result=main_event_result,
            sub_event_results=sub_event_results,
            synthesis_dict=synthesis_dict,
        )

    # ------------------------------------------------------------------
    # Output assembly
    # ------------------------------------------------------------------

    def _assemble_output(
        self,
        input_data: ResearchInput,
        main_event_result: RawResearchResult | None,
        sub_event_results: list[RawResearchResult],
        synthesis_dict: dict,
    ) -> ResearchOutput:
        """Merge raw research (news links) + synthesis (analysis) into
        the final ``ResearchOutput``."""

        raw_map = {r.event_id: r for r in sub_event_results}
        synth_sub_map: dict[str, dict] = {}
        sub_analyses = synthesis_dict.get("sub_event_analyses")
        if not isinstance(sub_analyses, list):
            alt = synthesis_dict.get("sub_event_research")
            sub_analyses = alt if isinstance(alt, list) else []
        for sa in sub_analyses:
            if not isinstance(sa, dict):
                continue
            sub_event_id = _as_str(sa.get("sub_event_id"))
            if sub_event_id:
                synth_sub_map[sub_event_id] = sa

        # Main event research
        main_research: MainEventResearch | None = None
        if input_data.main_event is not None:
            synth_main_raw = synthesis_dict.get("main_event_research", {})
            synth_main = synth_main_raw if isinstance(synth_main_raw, dict) else {}
            main_summary = _as_str(synth_main.get("summary")) or (
                main_event_result.research_text[:3000]
                if main_event_result and main_event_result.research_text
                else "No research available"
            )
            main_research = MainEventResearch(
                event_title=input_data.main_event.title,
                summary=main_summary,
                key_findings=_as_str_list(synth_main.get("key_findings"))[
                    : self.config.max_key_findings_per_event
                ],
                news_links=(
                    main_event_result.news_links if main_event_result else []
                ),
                sentiment=_parse_sentiment(_as_str(synth_main.get("sentiment")) or "neutral"),
                sentiment_rationale=_as_str(synth_main.get("sentiment_rationale")),
            )

        # Sub-event research list
        sub_research_list: list[SubEventResearch] = []
        for se in input_data.sub_events:
            raw = raw_map.get(se.id)
            synth = synth_sub_map.get(se.id, {})
            summary = _as_str(synth.get("summary")) or (
                raw.research_text[:3000]
                if raw and not raw.error and raw.research_text
                else "No research available"
            )
            sub_research_list.append(
                SubEventResearch(
                    sub_event_id=se.id,
                    sub_event_title=se.title,
                    summary=summary,
                    key_findings=_as_str_list(synth.get("key_findings"))[
                        : self.config.max_key_findings_per_event
                    ],
                    news_links=raw.news_links if raw else [],
                    sentiment=_parse_sentiment(_as_str(synth.get("sentiment")) or "neutral"),
                    sentiment_rationale=_as_str(synth.get("sentiment_rationale")),
                )
            )

        # Relationships (only when main event exists)
        relationships: list[SubEventRelationship] | None = None
        if input_data.main_event is not None:
            relationships = []
            raw_relationships = synthesis_dict.get("relationships")
            relationship_map: dict[str, dict] = {}
            if isinstance(raw_relationships, list):
                for rel in raw_relationships:
                    if not isinstance(rel, dict):
                        continue
                    sub_event_id = _as_str(rel.get("sub_event_id"))
                    if sub_event_id:
                        relationship_map[sub_event_id] = rel

            for se in input_data.sub_events:
                rel = relationship_map.get(se.id, {})
                relationships.append(
                    SubEventRelationship(
                        sub_event_id=se.id,
                        sub_event_title=_as_str(rel.get("sub_event_title")) or se.title,
                        relationship_summary=_as_str(rel.get("relationship_summary")),
                        influencing_news=_as_str(rel.get("influencing_news")),
                    )
                )

        synthesis_text = _as_str(synthesis_dict.get("synthesis")) or "Synthesis unavailable."

        return ResearchOutput(
            main_event_research=main_research,
            sub_event_research=sub_research_list,
            relationships=relationships,
            synthesis=synthesis_text,
            research_timestamp=datetime.now(timezone.utc).isoformat(),
        )


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------


def _parse_sentiment(value: str) -> SentimentRating:
    """Safely parse a sentiment string into the enum."""
    try:
        return SentimentRating(value.lower().strip())
    except ValueError:
        return SentimentRating.NEUTRAL


def _as_str(value: object) -> str:
    """Safely coerce values to a string while treating None as empty."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return str(value)


def _as_str_list(value: object) -> list[str]:
    """Safely coerce model output into a list of strings."""
    if isinstance(value, list):
        return [item for item in (_as_str(v).strip() for v in value) if item]
    if isinstance(value, str):
        stripped = value.strip()
        return [stripped] if stripped else []
    return []
