# Decisions

Choices made while building, in the order they came up. Each entry says what was decided and why, so it can be revisited.

## D1 · Versions

Pinned exactly (`.npmrc save-exact`, `uv.lock`). Latest stable on 18 Oct 2026 unless noted.

| Area                                           | Version                                       |
| ---------------------------------------------- | --------------------------------------------- |
| Node / pnpm                                    | 22 / 10.28.0                                  |
| TanStack Start / Router / Query / Table / Form | 1.169.3 / 1.170.45 / 5.104.4 / 9.3.1 / 1.33.5 |
| React / Vite / Tailwind CSS                    | 19.3.1 / 8.3.4 / 4.3.3                        |
| Zod / react-intl                               | 4.6.7 / 12.1.4                                |
| TypeScript                                     | 6.0.3 (see D2)                                |
| Vitest / Playwright                            | 5.0.5 / 1.64.1                                |
| Python / google-adk / FastAPI / Pydantic       | 3.12+ / 2.12.0 / 0.141.1 / 2.14.1             |

## D2 · TypeScript 6, not 7

typescript-eslint 8.71 supports TypeScript below 6.1. Moving to 7 waits for lint support.

## D3 · Quality loop added to the MVP scope

Product direction after the PRD: make built-in quality a daily, evidence-backed routine the buyer can verify, and give suppliers reasons beyond quality to share.

- **Daily checklist** (`/s/checklist`). Every check needs a photo, reading or scan. Pass or fail is computed on the server from the limits. An out-of-limit reading is rejected without a containment note.
- **Daily and weekly quality reports** (`/s/reports`, `/b/reports`). Drafted from the checklist, events and passports; a person approves; publishing seals the report with SHA-256 and chains it in the audit log. The buyer's Verify button recomputes the seal in the browser and the server re-hashes the chain.
- **Ask the evidence** (`/s/ask`, `/b/ask`). Answers cite records. Buyers only search scopes their consent covers.
- **Beyond quality.** Earned inspection tier (suggested by the record, decided by the buyer), on-time-in-full, 8D speed, and the buyer's own payment clock (F11 brought forward as a read-only view).
- **Sourcing pool** (`/b/sourcing`). Suppliers opt in to an evidence profile; buyers without a consent see depth of evidence, not records. Ordered by days of evidence. No public score, per doc 03.

Schema changes: consent scope `reports`; entities `ChecklistItem`, `CheckRecord`, `QualityReport`, `SupplierScorecard`, `EvidenceProfile`, `Invoice`; audit actions `check.record`, `cycle.open`, `buyer.view`.

## D4 · In-memory store until Firestore

`apps/web/src/lib/store.server.ts` holds the seed in memory and is the only data access the features use. The Firestore layer (M0) replaces it behind the same helpers. Writes last until the server restarts.

## D5 · Demo sign-in

A signed (HMAC) HttpOnly cookie holds the user id. The phone and email forms call a server function that returns `AUTH_NOT_CONFIGURED` until Identity Platform is wired in M0; demo accounts are listed on the sign-in page.

## D6 · Behaviour without the agent service

Without `AGENTS_BASE_URL` the app stays usable and honest about it:

| Feature         | Fallback                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Capture         | Keeps the operator's words, suggests the most used code for the stage, severity 3, no translation |
| Shift brief     | Assembled from the shift's events and containment notes, each line citing its record              |
| Ask             | Keyword search over consented records                                                             |
| Audit interview | Scripted follow-up questions                                                                      |
| 8D drafting     | None; returns `AGENT_UNAVAILABLE`                                                                 |

Every fallback output is still marked as a draft.

## D7 · Evidence upload

The device computes SHA-256 before sending. Signed-URL upload to Cloud Storage with a server-side hash (PRD §10) lands in M1; until then records carry the device hash and a pending path.

## D8 · Routes added or moved

NCR rooms live at `/s/ncr/$ncrId` and `/b/ncr/$ncrId` (one component) so each side keeps its own shell; lists at `/s/ncr` and `/b/ncr`. Added `/s/checklist`, `/s/reports`, `/s/ask`, `/b/reports`, `/b/ask`, `/b/sourcing`.

## D9 · 8D citation rule

D2–D7 must each cite evidence before the 8D can be approved. D1 (team) and D8 (closure condition) are not claims about what happened.

## D10 · Languages

English and Japanese are complete. Vietnamese, Hindi, Tamil and Bahasa Indonesia cover every screen line staff use (capture, checklist, events, shift brief, sign-in, navigation); other screens fall back to English. `pnpm i18n:check` fails on stale keys, placeholder mismatches or gaps in required screens. Tenant data (stage names, checklist labels) is stored per language; event summaries keep the original plus English.

## D11 · Demo clock

The seed runs on a fixed time: 11:20 at the Japanese plant on the current JST date, advancing in real time from server start. `SEED_DATE` pins the date for tests.

## D12 · Libraries beyond PRD §4

| Library                                                          | Why                                             |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| radix-ui, class-variance-authority, clsx, tailwind-merge, sonner | What shadcn/ui primitives are built on          |
| @tanstack/react-router-ssr-query                                 | Query cache hydration with Start SSR            |
| srvx                                                             | Serves the Start build on Node / Cloud Run      |
| python-ulid                                                      | ULID type used by the generated Pydantic models |
| prettier, typescript-eslint, TanStack ESLint plugins, tsx        | Formatting, linting, running TS scripts         |

Not added yet: Testing Library (no component tests so far) and a service worker. The offline outbox works without one; app-shell caching is M1.

## D13 · Canonical JSON

Keys sorted, no whitespace, `undefined` dropped, integral floats printed as integers. TypeScript and Python are tested against the same fixtures (`packages/schemas/fixtures`).

## D14 · Agent output

Specialists return JSON validated with Pydantic instead of ADK `output_schema`, so tools stay available on every agent. The tenant comes from session state set by the API, never from model arguments.

## D15 · Generated files in git

`apps/web/src/routeTree.gen.ts` and `services/agents/gembaleap_agents/schemas.py` are committed so typecheck and tests run without a build. CI regenerates the Pydantic models and fails on drift.
