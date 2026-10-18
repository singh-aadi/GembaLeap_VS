# GembaLeap

Shop-floor evidence that a supplier and its buyer can both check.

Line staff record each built-in-quality check with a photo, reading or scan, in their own language. Agents turn the day's records into a daily and weekly quality report; a person at the supplier approves it, it is sealed with a hash, and the buyer verifies it. Trust between supplier and OEM rests on evidence they can both see, and new suppliers can compete on their record.

## The loop

1. **Check at the station.** A check is not saved without evidence. A reading outside the limits is not saved without a containment note.
2. **Capture problems** by voice or photo. Agents structure them; the line lead confirms in one tap.
3. **Report.** Daily and weekly reports are drafted from the records. Every statement links to its evidence.
4. **Approve and seal.** The supplier approves; the report is hashed and chained in an append-only audit log.
5. **Verify.** The buyer recomputes the seal in the browser, asks questions of the evidence, and opens an NCR on a lot if needed.
6. **Earn.** The record supports reduced incoming inspection, faster 8D closure and a visible payment clock, and lets new suppliers be found by their evidence.

## What is in this repository

| Path               | Contents                                                                        | State                                         |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------------------- |
| `apps/web`         | TanStack Start app: supplier and buyer workspaces, phone and desktop            | Working on synthetic data                     |
| `packages/schemas` | Zod contracts, canonical JSON and seal hashing                                  | Source of truth for both languages            |
| `packages/seed`    | Synthetic buyer, two detailed suppliers, heat-map and sourcing rows             | Validated against the schemas                 |
| `services/agents`  | Python ADK agents, FastAPI, deterministic ranking and passport rules            | Rules and ranking run; agents need Gemini     |
| `services/workers` | Cloud Run job entry points                                                      | Contracts only                                |
| `evals`            | Eval runner, thresholds, 8D rubric                                              | Passport recall runs; others need golden sets |
| `infra`            | Terraform for Cloud Run, Firestore, Storage, KMS, Pub/Sub, BigQuery             | Validated, not applied                        |
| `docs`             | [PRD](docs/prd.md), [decisions](docs/decisions.md), [demo script](docs/demo.md) |                                               |

Not wired yet: Firestore, Identity Platform, Cloud Storage uploads, the service worker. See [decisions D4–D7](docs/decisions.md).

## Run it

Requires Node 22, pnpm 10 and, for the agent service, [uv](https://docs.astral.sh/uv/).

```sh
pnpm install
pnpm dev                     # http://localhost:3000
```

Sign in with a demo account on the sign-in page:

| Account                  | Role                                    | Sees                                                        |
| ------------------------ | --------------------------------------- | ----------------------------------------------------------- |
| Nguyen Thi Lan           | Line lead, Sato Press Works             | Today, checklist, capture, events, shift brief (Vietnamese) |
| Haruka Sato              | Owner, Sato Press Works                 | Everything on the supplier side, including sharing          |
| Kenji Mori, Meena Pillai | Quality leads                           | Checklist, reports, lots and passports, NCRs                |
| Arjun Mehta              | Supplier quality, Kestrel Fluid Systems | Heat-map, reports, passports, NCR rooms, sourcing           |
| Kaori Yamamoto           | Procurement, Kestrel Fluid Systems      | Heat-map and sourcing, read-only                            |

Agent service:

```sh
cd services/agents
uv sync
GEMINI_FLASH_MODEL=... GEMINI_PRO_MODEL=... uv run uvicorn gembaleap_agents.api:app --port 8080
```

Then start the web app with `AGENTS_BASE_URL=http://localhost:8080`. Other settings are in [`.env.example`](.env.example).

## Checks

```sh
pnpm typecheck && pnpm lint && pnpm test   # TypeScript
pnpm i18n:check                            # message coverage per locale
pnpm e2e                                   # Playwright, desktop and phone
cd services/agents && uv run pytest        # Python
```

CI runs all of these plus the evals, a contract drift check and `terraform validate`.

## Layout

```
apps/web/src/
  routes/              file-based routes: /s/* supplier, /b/* buyer
  features/<module>/   api.ts (server functions), queries.ts, components/
  components/ui/       primitives
  components/app/      shell, evidence links, ladder, AI draft marker
  lib/                 auth, session, store, i18n, formatting
apps/web/messages/     en, ja, vi, hi, ta, id
services/agents/gembaleap_agents/
  agents/  prompts/  tools/      one agent per job, versioned prompts, tenant-scoped tools
  scoring.py  rules.py           ranking and passport rules in code, not in prompts
  schemas.py                     generated from packages/schemas
```

## Rules this code keeps

- Every server function checks the user, the tenant and, for buyers, a live consent.
- AI output is marked as a draft and links its evidence until a named person approves it.
- Rankings, rule checks and hashes are computed in code. Models read, structure and draft.
- Demo data is synthetic. No real company data.
