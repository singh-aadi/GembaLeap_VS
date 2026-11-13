from pathlib import Path

from google.adk.agents import LlmAgent

from ..config import settings

PROMPTS = Path(__file__).parent.parent / "prompts"


def prompt(name: str) -> str:
    return (PROMPTS / f"{name}.md").read_text(encoding="utf-8")


def specialist(name: str, tier: str, description: str, tools: list) -> LlmAgent:
    """One agent, one job: a versioned prompt, a model tier from env and a fixed tool allow-list."""
    return LlmAgent(
        name=name,
        model=settings().model(tier),
        description=description,
        instruction=prompt(name),
        tools=tools,
    )
