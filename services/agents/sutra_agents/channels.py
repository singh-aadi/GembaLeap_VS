"""WhatsApp Business webhook. One record model whether a check arrives by app or by chat.

Outbound replies go through the provider's send API once a provider is chosen (open question in
the PRD); until then the route decision is returned in the response for logging.
"""

from typing import Any, Literal

from pydantic import BaseModel

Route = Literal["gauge_reader", "voice_to_event", "ask", "help"]


class Inbound(BaseModel):
    sender: str
    kind: Literal["image", "audio", "text", "other"]
    text: str | None = None
    media_id: str | None = None


def parse(payload: dict[str, Any]) -> list[Inbound]:
    """Extracts messages from a WhatsApp Cloud API webhook body."""
    out: list[Inbound] = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            for msg in change.get("value", {}).get("messages", []):
                kind = msg.get("type")
                kind = kind if kind in ("image", "audio", "text") else "other"
                out.append(
                    Inbound(
                        sender=msg.get("from", ""),
                        kind=kind,
                        text=(msg.get("text") or {}).get("body"),
                        media_id=(msg.get(kind) or {}).get("id")
                        if kind in ("image", "audio")
                        else None,
                    )
                )
    return out


def route(message: Inbound) -> Route:
    """Deterministic routing: a photo is a check, a voice note is an event, text is a question."""
    if message.kind == "image":
        return "gauge_reader"
    if message.kind == "audio":
        return "voice_to_event"
    if message.kind == "text" and message.text and len(message.text.strip()) > 3:
        return "ask"
    return "help"
