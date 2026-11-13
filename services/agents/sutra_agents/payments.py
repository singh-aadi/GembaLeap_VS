"""Payment clock and three-way match. Mirrors packages/schemas/src/rules.ts."""

from datetime import datetime
from typing import Literal

MSMED_LIMIT_DAYS = 45

Status = Literal["paid_on_time", "paid_late", "overdue", "due_soon", "open"]


def _days(start: str, end: str) -> int:
    def parse(s: str) -> datetime:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))

    return (parse(end) - parse(start)).days


def payment_clock(
    issued_at: str, paid_at: str | None, now: str, term_days: int = MSMED_LIMIT_DAYS
) -> tuple[int, int, Status]:
    """MSMED Act: MSME invoices must be paid within 45 days of acceptance."""
    day = _days(issued_at, paid_at or now)
    limit = min(term_days, MSMED_LIMIT_DAYS)
    if paid_at:
        return day, limit, "paid_on_time" if day <= limit else "paid_late"
    if day > limit:
        return day, limit, "overdue"
    return day, limit, "due_soon" if day > limit - 7 else "open"


def invoice_match(
    po_qty: float,
    po_price: float,
    grn_qty: float,
    inv_qty: float,
    inv_price: float,
    price_tolerance: float = 0.005,
) -> list[str]:
    """Three-way match of PO, goods receipt and invoice. Empty list means matched."""
    issues: list[str] = []
    if inv_qty > grn_qty:
        issues.append("qty_exceeds_grn")
    if inv_qty > po_qty:
        issues.append("qty_exceeds_po")
    if abs(inv_price - po_price) > po_price * price_tolerance:
        issues.append("price_mismatch")
    return issues
