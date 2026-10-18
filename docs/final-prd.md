# GembaLeap — Final PRD and pitch brief

Team SLB VectorSynapse · AI Builder Cup (Manufacturing: Intelligent Operations & Industrial Efficiency)
Version 2.0 · 18 Oct 2026 · supersedes PRD v1.0 (`docs/prd.md`)

> Use this file as the source for the final deck. Section 13 maps it to slides.

---

## 1. One line

**Built-in quality, proven daily.** Suppliers capture evidence at every step of the line; AI turns it into daily and weekly quality reports that the OEM can verify, question and trust. Trust between supplier and buyer becomes a matter of evidence, not history.

## 2. What changed from v1.0 (the reframe)

| | v1.0 framing | v2.0 framing |
|---|---|---|
| Core idea | Maturity score, ranked bottleneck, lot passport | **Daily built-in quality routine** whose evidence flows to the buyer as verifiable reports |
| Quality proof | Episodic: audits, passports, 8Ds | **Continuous:** every check on every shift carries evidence; reports every day and week |
| Buyer experience | Heat-map of supplier maturity | Heat-map **plus** sealed reports they verify in one click and an assistant they can question |
| Supplier motivation | Free maturity score, fair price talks | Evidence **earns** something concrete: lighter inspection, faster closure, payment on time, new buyers |
| Market effect | One buyer, its suppliers | **More vendors can compete** on their record; healthy competition, better output |
| AI role | Reads, structures, drafts | Same, plus **report drafting and evidence Q&A**; people still approve every decision |

Nothing from v1.0 is dropped; maturity, bottlenecks, 8D and passports now feed the daily loop.

## 3. Reframed problem

**Problem statement.** OEMs cannot see whether quality is being built in at their suppliers day by day, so they compensate with 100% incoming inspection, snapshot audits and slow, adversarial NCR cycles. Small suppliers can't prove the good work they do, because the evidence lives on paper travellers, in phones and in people's heads. Trust is inherited from history, not earned from evidence, which also locks out capable new vendors.

**Root cause (unchanged, now sharper).** Capturing evidence at the gemba costs the operator more than it gives back, and nothing turns that evidence into something the buyer can check.

**How might we**
1. Make recording a check with evidence faster than skipping it, in the worker's own language?
2. Turn a day of shop-floor evidence into a report an OEM can read in two minutes and verify in one click?
3. Let a supplier's record earn it lighter inspection, faster payment and new customers?

**Point of view.** Haruka, owner of a 45-person Tier-2 stamping plant, knows her line runs well but cannot show it. Arjun, supplier quality engineer at a valve OEM with 140 suppliers, inspects everything because he has no time not to.

## 4. Impact

| Who | Today | With GembaLeap |
|---|---|---|
| Line lead | Fills paper check sheets at shift end from memory | 20-second check with photo/reading; out-of-limit forces containment on the spot |
| Supplier owner | Cannot prove quality; argues price and rejections | Sealed daily/weekly reports; visible first-time-right streak; eligible for reduced inspection |
| Supplier quality | Writes 8Ds in Word, closes on paper | AI-drafted 8D with evidence on every field; cycle closes only with new evidence |
| Buyer SQE | 100% inspection, snapshot audits, emails | Watch-list of drifting suppliers; verifiable reports; ask the evidence; earned-inspection decisions |
| Buyer procurement | Price talks on email, few vendors | Evidence-based vendor pool; fair, documented record (Toriteki Act, India 45-day rule) |
| Network | Same few trusted suppliers | New vendors compete on days of evidence, not years of history |

**Success measures** (pilot hypotheses, to be measured)

| Measure | Type | Target for pilot |
|---|---|---|
| Verified improvement cycles closed per supplier per quarter | North star | ≥ 1 for 60% of suppliers |
| Checklist adherence with evidence (checks recorded ÷ scheduled) | Leading | ≥ 95% |
| Out-of-limit readings with containment recorded | Guardrail | 100% (enforced by the app) |
| Reports published on time and verified by buyer | Trust | ≥ 90% of days |
| First-time-right lot passports | Outcome | +20% vs baseline |
| Incoming inspection hours per lot for suppliers on reduced tier | Outcome | −30% |
| Invoices paid within agreed term | Two-way trust | ≥ 90% |
| New vendors qualified from the sourcing pool | Network | ≥ 1 per anchor buyer per quarter |

## 5. Users and roles

| Role | Persona | Side | Primary screens |
|---|---|---|---|
| `line_lead` | Nguyen Thi Lan, line lead (Vietnamese) | Supplier | Today, Checklist, Capture, Events, Shift brief |
| `supplier_owner` | Haruka Sato, owner | Supplier | Home, everything supplier-side, Sharing |
| `supplier_quality` | Kenji Mori / Meena Pillai | Supplier | Checklist, Reports, Lots & passports, NCR & 8D, Ask |
| `buyer_quality` | Arjun Mehta, SQE | Buyer (OEM) | Suppliers heat-map, Reports, Passports, NCR rooms, Ask, Sourcing |
| `buyer_procurement` | Kaori Yamamoto, category manager | Buyer (OEM) | Suppliers (read-only), Sourcing, Ask |

Each user belongs to one tenant. Buyers see supplier data only through a live, scoped, revocable consent.

## 6. The quality loop

1. **Check at the station.** Daily checklist per stage. No evidence, no record. Out of limit, no record without containment.
2. **Capture problems.** Voice/photo/text in any language → AI-structured event → one-tap confirm. Works offline.
3. **Report.** AI drafts daily and weekly reports from checks, events and passports; every statement cites evidence.
4. **Approve and seal.** A person approves; report is hashed (SHA-256) and chained in an append-only audit log.
5. **Verify and ask.** OEM recomputes the seal in the browser, asks questions of the evidence, raises an NCR if needed.
6. **Improve and earn.** Bottlenecks ranked, 8D drafted, cycles closed on new evidence; record earns lighter inspection and visibility to new buyers.

## 7. Features (current scope)

| ID | Feature | Module | Status in scaffold |
|---|---|---|---|
| F1 | Multimodal capture → structured event, 6 languages, offline queue | Gemba Capture | Working (AI drafting needs Gemini) |
| F10 | Shift handover brief with loss Pareto, acknowledged at handover | Gemba Capture | Working |
| **F16** | **Daily built-in-quality checklist**: evidence mandatory, limits computed server-side, containment enforced | Gemba Capture | Working |
| **F17** | **Daily and weekly quality reports**: AI-drafted, human-approved, hash-sealed, buyer-verifiable | Trust Ledger | Working |
| **F18** | **Ask the evidence**: Q&A with citations, scoped to consent | Trust Ledger | Working (keyword fallback; agent for full answers) |
| F2 | AI process audit → L0–L5 per stage × 5 dimensions, every score cites evidence; accept/dispute | Maturity Lens | Working |
| F3 | Bottleneck ranking (deterministic formula, shown transparently) | Bottleneck Radar | Working |
| F4 | NCR & 8D shared room; 8D needs evidence on D2–D7; cycle closes only on new evidence | Kaizen Cadence | Working |
| F5 | Lot passport: rule checks (heat match, chemistry, hydro, dimensions, hash), fix, seal | Trust Ledger | Working |
| F6 | Consent-scoped sharing (maturity, cycles, passports, reports), revocation, access log | Trust Ledger | Working |
| F9 | Buyer supplier heat-map (table + grid), filters in URL | Trust Ledger | Working |
| **F15** | **Earned inspection tier**: record suggests, buyer decides | Trust Ledger | Working (pulled forward from "Could") |
| **F11** | **Payment clock** visible to both sides | Trust Ledger | Working as view (pulled forward from "Should") |
| **F19** | **Evidence profile + sourcing pool**: opt-in, ordered by days of evidence, no public score | Trust Ledger | Working |
| F7 | 30-day leap plan with LINE/WhatsApp nudges | Kaizen Cadence | Pilot |
| F8 | Negotiation brief with cost evidence | Trust Ledger | Phase 2 |
| F12, F13, F14 | Video SOP, SAP/MES connectors, live camera check | — | Later / Won't now |

**Selling points beyond quality:** lighter incoming inspection, faster 8D closure, on-time-in-full visibility, the buyer's own payment record, documented fair dealing, and access to new buyers.

## 8. Principles (guardrails)

- AI reads, structures and drafts; **a named person approves** everything another party sees.
- **Rankings, rule checks and hashes are computed in code**, never in a prompt.
- Every AI statement **links to its evidence**; drafts are visibly marked.
- **Supplier owns its data**; sharing is scoped, time-limited, revocable, and every view is logged.
- **No public supplier ranking**; benchmarks need ≥ 5 plants per cell.
- Phone-first, local-language, works offline; no sensors or hardware required.

## 9. Solution architecture (Google Cloud)

| Layer | Choice |
|---|---|
| Web app + BFF | TanStack Start (React, TypeScript) on Cloud Run; phone (bottom tabs) and desktop (sidebar) |
| Contracts | Zod (single source) → JSON Schema → generated Pydantic |
| Agents | Python, Google ADK, Gemini on Vertex AI (Flash / Pro tiers from env), FastAPI on Cloud Run (internal only) |
| Data | Firestore, Cloud Storage (signed URLs), BigQuery (evals, benchmarks) |
| Trust | SHA-256 seals, append-only hash-chained audit log, daily anchor signed with Cloud KMS |
| Async | Pub/Sub, Cloud Scheduler, Cloud Run jobs (daily report draft, shift brief, nightly rank, audit anchor) |
| Identity | Identity Platform: phone OTP for plant staff, email for buyers; tenant + role claims |
| IaC / CI | Terraform, GitHub Actions |

**Agents:** Capture (Flash), Shift brief (Flash), Maturity auditor (Pro), Bottleneck classifier (Flash), Quality 8D (Pro), Passport extractor (Flash), Report drafter (Flash), Ask (Flash), Orchestrator for chat channels. Trust steward is pure code.

**Deterministic formulas**
```
stage_level = min over dimensions of level, each backed by ≥ 1 evidence item
site_index  = Σ w_s·L_s / Σ w_s,   w_s = 1 + loss_s / Σ loss
priority    = loss₃₀ × |λ_factor| × (1 + recurrence) / effort      (λ from Ongbali et al. 2021)
seal        = sha256(canonicalJSON(report))
audit hash  = sha256(prevHash + canonicalJSON(entry))
```

## 10. Evaluations

| Eval | Pass bar | State |
|---|---|---|
| Capture code accuracy (60 events, 4 languages) | ≥ 85% | Needs golden set |
| Translation fidelity (30 vi/hi notes) | 0 safety-relevant losses | Needs golden set |
| Maturity score agreement (6 plants) | Within 1 level on ≥ 90% | Needs golden set |
| 8D quality (10 NCRs, rubric) | Mean ≥ 4/5 | Needs golden set |
| **Report citations valid** (new) | 100% of claims cite real evidence | Needs golden set |
| Passport recall (40 lots, 12 seeded errors) | 12/12 flagged, < 10% false warnings | **Passing: 12/12, 0% false** |

## 11. What is built (proof for judges)

- Working app on synthetic data: 1 OEM buyer, 2 detailed suppliers (stamping in Japan, valves in India), 8 suppliers on the heat-map, 4 in the sourcing pool.
- Role-based screens for 5 roles, phone and desktop, English and Japanese complete; Vietnamese, Hindi, Tamil, Bahasa Indonesia for line screens.
- 9 end-to-end tests pass: check with evidence; containment enforcement; one-tap confirm; publish → buyer verifies seal; heat-number mismatch → fix → seal; heat-map filters; revocation removes access; phone layout; procurement restrictions.
- 45 TypeScript and 19 Python unit tests; Terraform validated; CI defined.
- Not yet wired: Firestore, Identity Platform, Cloud Storage upload, Gemini keys, service worker.

## 12. Cost and business model (estimates from doc 04)

- 30-supplier pilot ≈ USD 150–450 per month on Google Cloud.
- Hypothesised price USD 40 per supplier per month, paid by the anchor buyer (≈ USD 1,200/month).
- Phases: **MVP** (this scope) → **Pilot** (1 buyer, 30 suppliers, F7 nudges, real auth/storage) → **Network** (second buyer accepts an existing supplier's record without re-auditing).

## 13. Suggested deck flow

| # | Slide | Source |
|---|---|---|
| 1 | Title + one line | §1 |
| 2 | Problem: trust inherited, not earned | §3 |
| 3 | Personas (Haruka, Lan, Arjun, Kaori) | §5 |
| 4 | What changed: built-in quality, proven daily | §2 |
| 5 | The loop (6 steps) | §6 |
| 6 | Features and selling points beyond quality | §7 |
| 7 | Demo screens: checklist, sealed report, verify, heat-map, sourcing | §11, `docs/demo.md` |
| 8 | Architecture and agents on Google Cloud | §9 |
| 9 | Responsible AI: human approval, code decides, consent | §8 |
| 10 | Evals and what's proven | §10, §11 |
| 11 | Impact and success measures | §4 |
| 12 | Cost, business model, roadmap | §12 |

## 14. 3-minute demo script

| Time | Who | Do | Point out |
|---|---|---|---|
| 0:00 | Lan (line lead) | Checklist: record the packing photo | Vietnamese UI; can't save without a photo |
| 0:30 | Lan | Record hole pitch 48.15 mm | Out of limit: needs containment |
| 0:50 | Lan | Capture a voice note, confirm the draft | Original language kept; audit entry |
| 1:20 | Haruka (owner) | Home | Built-in quality today; what evidence earns |
| 1:40 | Haruka | Approve and publish weekly report | Every line cites evidence; sealed |
| 2:00 | Arjun (OEM SQE) | Reports → Verify | Seal recomputed in browser; chain intact |
| 2:20 | Arjun | Suppliers grid → Sato Press Works | Suggested reduced inspection; payment clock |
| 2:40 | Arjun | Sourcing | New vendors compete on evidence |
| 2:50 | Haruka | Revoke consent | Access ends at once |
