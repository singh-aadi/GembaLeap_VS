## Project Team Name / Potential Startup Name
SutraOS

## Are you planning to build a venture out of this project?
Yes

## How many members are working together on this?
1

## Intended Industry/Vertical
Manufacturing (pick "Manufacturing" or "Industrial / MSME"; not Oil and gas)

## One sentence summary
SutraOS is an AI-powered process-transformation platform that turns the everyday shop-floor work of Indian MSME supplier plants into a sealed, verifiable quality record, so they climb a 5-level maturity ladder (L1–L5) that OEM buyers, ZED certifiers and lenders can trust, cutting inspection, speeding up payment and winning new orders.

## What is the main problem?
India's MSME supplier plants often make good parts but cannot prove it. Quality evidence lives on paper check sheets filled at shift end, in WhatsApp photos and in one supervisor's head. So OEM buyers fall back on 100% incoming inspection, repeated audits and long payment terms. Invoices take about 73 days to clear against the 45-day MSMED legal limit, often because quality is disputed. Certification stalls at entry level: ~6.67 lakh ZED Bronze certificates vs only ~11,500 Silver + Gold. Only 21% of MSMEs use ERP or business software, yet 65.8% already use AI tools (CII-ISB, Oct 2026). The appetite for AI is there; the process underneath is not. ERPs digitise a broken process and consultants leave a binder and walk away, so capable plants stay invisible, under-paid and locked out of new OEM business while India pushes component localisation.

## Who would be a typical user/customer?
Paying customers: OEMs and Tier-1 buyers in auto components and industrial or energy equipment. They fund supplier onboarding through an anchor-buyer programme (₹3,500 per supplier per month).

Users:
1) Supplier owner of a small precision-engineering plant (machining, sheet metal, fabrication, castings; ₹10–100 crore turnover; 25–250 people) in the Pune–Chakan–Nashik belt. Wants a level, sealed reports, faster payment and new buyers.
2) Operators and line leads: record a check in 20 seconds by photo or voice in Marathi, Hindi or Tamil.
3) Buyer quality engineer: verifies reports in one click, runs NCRs.
4) Buyer procurement: sources from a pool of proven suppliers.
5) Sutra Coach: baselines the plant, maps leaks, switches on AI skills.
Wave 2: Coimbatore and Rajkot clusters, then ZED facilitators and lenders.

## What is your solution?
The Sutra Method, delivered as software plus field coaching:
1) Baseline: a coach's one-day walk scores the plant L0–L5 on five dimensions, each backed by evidence.
2) Map leaks: current vs future process flow with leak points marked.
3) Add micro-AI: 5+ small skills, one per leak, each with one metric (gauge reader, paper-sheet digitiser, voice-to-event, report drafter, 8D drafter, drift alerts, invoice matcher).
4) Run daily: a phone checklist with photo proof and limits checked in code. An out-of-limit part cannot pass without containment.
5) Prove: daily and weekly reports are SHA-256 sealed and hash-chained; the buyer verifies in one click.
6) Earn: reduced inspection, a 45-day payment clock with TReDS referral, ZED/ISO/IATF audit packs and an evidence-based sourcing pool.
Principle: AI drafts, code decides, a named person approves, and the supplier owns its data. It works on WhatsApp, Drive and Sheets for micro plants, a mobile PWA in local languages, and ERP connectors for larger ones.

## Stage of product
Minimal Viable Product (MVP)
(Working web + mobile app with supplier, buyer and coach workspaces on synthetic data, deployed at https://sutraos.vercel.app; agent service built with Google ADK.)

## Potential business model
B2B2B. Buyers fund onboarding; suppliers upgrade as they grow.
1) Anchor buyer programme: OEM/Tier-1 pays ₹3,500 per supplier per month, including buyer seats and verification.
2) Transformation sprint: ₹1.5 lakh one-time per plant (baseline, redesign, 90-day coaching). Often offset by ZED handholding support (up to ₹2 lakh consultancy, ₹3 lakh technology).
3) Supplier subscription from month 6: Start ₹999 · Grow ₹4,999 · Prove ₹9,999 · Pro ₹24,999 per month.
4) Sourcing network: ₹5 lakh per buyer per year for the evidence-based vendor pool.
5) Upside: referral fees from TReDS and lending partners. No take rate on orders.
Unit economics: ~₹16,000 revenue per supplier per month in the pilot vs ₹450–1,300 cloud + AI cost and ~₹4,500 coach cost. CAC ~₹15,000 via anchor buyers.
Market: TAM ~₹3,400 crore (9.49 lakh ZED-registered units); SAM ~₹1,800 crore; target ₹120 crore ARR by 2030 (10,000 plants).

## Primary competitors and how we differ
1) Small-business ERPs (Tally, Zoho, Odoo, SAP Business One) handle accounting and inventory but digitise the existing process and capture no shop-floor quality evidence. We integrate with them, never replace them.
2) Buyer supplier portals and QMS (SAP Ariba, OEM portals) are built for the buyer, so suppliers re-type data into each portal. We feed them all from one supplier-owned record.
3) Manufacturing marketplaces aggregate demand but take a margin and keep the capability data. Suppliers own their SutraOS record, with no take rate.
4) Lean and quality consultants and ZED facilitators bring trust and expertise but are episodic, and improvement fades after the audit. We partner with and equip them.
Our edge: process redesign plus small, cheap AI plus a vernacular field coach network, a published maturity ladder, and a sealed, portable evidence record that gets more valuable with every buyer (network effect).

## Primary and secondary target countries
Primary: India. We start with precision-engineering supplier clusters in Pune–Chakan–Nashik (Maharashtra), then Coimbatore (Tamil Nadu) and Rajkot (Gujarat), with Marathi, Hindi, Tamil, Gujarati and Kannada support.
Secondary: South-East Asian supplier economies with the same OEM-supplier gap and Japanese/global OEM supply chains, namely Vietnam and Indonesia (Vietnamese and Bahasa Indonesia are already in the app), then Japan for OEM-led supplier development programmes.

## Pitch deck
(Upload your PDF deck.)

## How are you planning to use AI?
AI is used in small, single-purpose skills at the exact points where shop-floor work leaks; it never makes the final decision.
- Gauge/meter reader: photo → reading + unit (≥98% accuracy)
- Paper check-sheet digitiser: photo → structured rows
- Voice-to-event: voice note in Marathi/Hindi/Tamil → coded defect event
- Drawing/PO → draft control plan
- Mill test certificate checker vs spec
- Daily/weekly report drafter where every claim cites a record
- Shift handover brief
- SPC drift explainer
- CAPA/8D drafter
- Audit-pack mapper to ZED/ISO 9001/IATF clauses (zero invented evidence)
- Invoice/PO/GRN matcher
- "Ask the evidence" Q&A with citations
- Government scheme finder
Pass/fail, level, ranking and sealing stay in deterministic code, and a named person approves every AI draft. A cost-aware router starts on the cheapest model and escalates only when needed, so AI costs stay at a few hundred rupees per plant per month.

## Google AI models
Gemini API, Gemma, Other (Vertex AI Gemini Flash-Lite / Flash / Pro)

## How we leverage the selected Google models
Built with Google ADK on Vertex AI as small agents with a deterministic escalation router in code:
- Gemini Flash-Lite (default, cheapest): gauge reading from phone photos, shift briefs, SPC drift notes, invoice matching. Used at high volume across the floor.
- Gemini Flash: multilingual voice-to-event (Marathi/Hindi/Tamil/Gujarati/Kannada), paper-sheet digitising, MTC checks, report drafting with citations, "Ask the evidence", audit-pack mapping.
- Gemini Pro: only for heavy reasoning, such as turning drawings/POs into control plans, coach baselines and 8D root-cause drafts.
- Escalation happens when confidence is low or input is long. Every call logs model, cost and latency.
- Gemini's multimodal input (image + audio + text) lets operators work by photo and voice with no typing.
- Gemma (planned): on-device/edge reading for low-connectivity plants.
- Outputs are JSON validated with Pydantic; claims must cite records; evals gate releases (recall, citation validity, rubric scores).

## Development platforms
Google AI Studio, Others (Google ADK, Vertex AI, Cloud Run, TanStack Start/React, FastAPI, Terraform)

## Deploy and scale on Google Cloud
Region asia-south1 (Mumbai) with backups in asia-south2 (Delhi) for Indian data residency. Infrastructure is defined in Terraform and shipped via GitHub Actions.
- Cloud Run: web app (TanStack Start/Nitro) and the FastAPI + ADK agent service. Scales to zero for idle tenants and scales out per request.
- Vertex AI: Gemini inference, Agent Engine, Vector Search for "Ask the evidence", Evaluation.
- Tiered storage that follows the plant: T1 micro plants live in their own Google Drive/Sheets; T2 uses Firestore per tenant + Cloud Storage with signed URLs; T3 adds BigQuery + Looker, CMEK and ERP sync.
- Pub/Sub + Cloud Scheduler + Cloud Run jobs: daily reports, shift briefs, level recompute, audit-log anchoring.
- Identity Platform (phone OTP for staff, email for buyers); Secret Manager; Cloud Logging and Monitoring.
- Multi-tenant isolation per supplier, with a consent-scoped buyer view.
Cost scales at roughly USD 150–450 per 30 suppliers per month.

## How did you hear about the Buildathon?
(Your answer, e.g. "LinkedIn" / "Hack2skill email" / "Google for Developers community")
