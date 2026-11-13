# SutraOS

Indian supplier plants do good work they cannot prove, so buyers over-inspect, pay late and lock out capable new vendors. SutraOS re-engineers the plant flow, adds small AI where work leaks, and turns daily work into a sealed record that moves the plant up the Sutra Maturity Ladder (L0–L5) and that buyers, certifiers and lenders can verify.

Business case: [docs/brd.md](docs/brd.md) · Product: [docs/prd.md](docs/prd.md) · Decisions: [docs/decisions.md](docs/decisions.md) · Demo: [docs/demo.md](docs/demo.md)

## The Sutra Method

1. **Baseline.** A coach's one-day walk gives a level L0–L5, every dimension backed by evidence.
2. **Map leaks.** Current flow vs future flow, with leak points marked.
3. **Add micro-AI.** Five or more small skills, one per leak point, each with one metric.
4. **Run daily.** Check with a photo, capture problems by voice, contain out-of-limit parts.
5. **Prove.** Sealed daily and weekly reports; the buyer verifies in one click.
6. **Earn.** Less inspection, faster payment, new buyers, the next ZED level.

AI drafts, code decides, a named person approves, and the supplier owns its data.

## What is in this repository

| Path               | Contents                                                                                                    | State                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `apps/web`         | TanStack Start app: supplier, buyer and coach workspaces, phone and desktop                                 | Working on synthetic data         |
| `packages/schemas` | Zod contracts, Sutra rules (level, streak, payment clock, escalation, schemes, invoice match), seal hashing | Source of truth for TS and Python |
| `packages/seed`    | Chakan beachhead plant, coach, OEM buyer, the earlier pilot plants                                          | Validated against the schemas     |
| `services/agents`  | Python ADK agents, FastAPI, rules endpoints, WhatsApp webhook                                               | Rules run; agents need Gemini     |
| `services/workers` | Cloud Run job entry points                                                                                  | Contracts only                    |
| `evals`            | Eval runner, thresholds, rubric                                                                             | MTC/passport recall runs          |
| `infra`            | Terraform (asia-south1)                                                                                     | Validated, not applied            |

Not wired yet: Firestore and the Drive/Sheets tier, Identity Platform, Cloud Storage uploads, WhatsApp replies, ERP connectors, SPC alerts. See [decision D16](docs/decisions.md).

## Run it

Node 22, pnpm 10; [uv](https://docs.astral.sh/uv/) for the agent service.

```sh
pnpm install
pnpm dev                     # http://localhost:3000
```

| Demo account    | Role                                 | Sees                                                                |
| --------------- | ------------------------------------ | ------------------------------------------------------------------- |
| Ravi Patil      | Operator, Shinde Precision (Marathi) | Today, checklist, capture                                           |
| Sunita Jadhav   | Line lead, Shinde Precision          | Checklist, capture, events, shift brief                             |
| Suresh Shinde   | Owner, Shinde Precision              | Level, skills, audit packs, cash, sharing, everything supplier-side |
| Amol Kulkarni   | Sutra Coach                          | Plants, baseline, process map, recipe picker                        |
| Arjun Mehta     | Buyer quality, Kestrel Fluid Systems | Heat-map, reports, passports, NCR rooms                             |
| Priya Deshpande | Buyer procurement, Kestrel           | Heat-map, sourcing                                                  |

Haruka, Lan, Kenji and Meena remain from the first pilot (Japan and Coimbatore plants).

Agent service:

```sh
cd services/agents && uv sync
GEMINI_FLASH_LITE_MODEL=... GEMINI_FLASH_MODEL=... GEMINI_PRO_MODEL=... \
  uv run uvicorn sutra_agents.api:app --port 8080
```

Then start the web app with `AGENTS_BASE_URL=http://localhost:8080`. Settings are listed in [`.env.example`](.env.example).

## Checks

```sh
pnpm typecheck && pnpm lint && pnpm test
pnpm i18n:check
pnpm e2e
cd services/agents && uv run pytest
```

## Deploy

The web app builds with the Nitro Vite plugin, so it deploys to Vercel as well as Cloud Run (`infra/`).
