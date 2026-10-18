"""Root agent for chat channels. The web app calls specialists directly through the API."""

from google.adk.agents import LlmAgent

from .agents import specialists
from .agents.base import prompt
from .config import settings


def orchestrator() -> LlmAgent:
    return LlmAgent(
        name="gembaleap",
        model=settings().model("flash"),
        description="Routes chat messages to the capture and ask specialists.",
        instruction=prompt("orchestrator"),
        sub_agents=[specialists.capture(), specialists.ask()],
    )
