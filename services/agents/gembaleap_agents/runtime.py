"""Runs one specialist turn and validates its JSON output."""

import json
import re
import uuid
from typing import Any

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.genai import types
from pydantic import BaseModel

_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$")


class AgentOutputError(ValueError):
    pass


async def run_json[T: BaseModel](
    agent: LlmAgent, tenant_id: str, payload: dict[str, Any], output: type[T]
) -> T:
    runner = InMemoryRunner(agent=agent, app_name="gembaleap")
    session = await runner.session_service.create_session(
        app_name="gembaleap", user_id=tenant_id, state={"tenant_id": tenant_id}
    )
    message = types.Content(role="user", parts=[types.Part.from_text(text=json.dumps(payload))])
    text = ""
    async for event in runner.run_async(
        user_id=tenant_id, session_id=session.id, new_message=message
    ):
        if event.is_final_response() and event.content and event.content.parts:
            text = "".join(part.text or "" for part in event.content.parts)
    try:
        return output.model_validate_json(_FENCE.sub("", text.strip()))
    except ValueError as error:
        raise AgentOutputError(
            f"{agent.name} returned invalid output ({uuid.uuid4().hex[:8]})"
        ) from error
