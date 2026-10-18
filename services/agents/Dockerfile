FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY gembaleap_agents ./gembaleap_agents
RUN uv sync --frozen --no-dev
ENV PORT=8080
CMD ["sh", "-c", "uv run --no-dev uvicorn gembaleap_agents.api:app --host 0.0.0.0 --port $PORT"]
