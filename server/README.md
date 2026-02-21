# Unified Server

This directory now hosts the single FastAPI server for both:
- market search/positions endpoints
- research agent endpoint

## Run

```bash
cd server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

- `GET /` - health check
- `GET /health` - health check (agent-compatible)
- `POST /search` - vector search over Polymarket events
- `GET /positions/{user}` - positions from Polymarket data API
- `POST /research` - run research pipeline over events
