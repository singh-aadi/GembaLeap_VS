#!/usr/bin/env bash
# Regenerates gembaleap_agents/schemas.py from the Zod contracts in packages/schemas.
set -euo pipefail
cd "$(dirname "$0")/.."
(cd ../.. && pnpm --filter @gembaleap/schemas export)
uv run datamodel-codegen \
  --input ../../packages/schemas/dist/json-schema/gembaleap.schema.json \
  --input-file-type jsonschema \
  --output-model-type pydantic_v2.BaseModel \
  --target-python-version 3.12 \
  --use-standard-collections \
  --use-union-operator \
  --use-title-as-name \
  --formatters ruff-format \
  --custom-file-header "# Generated from packages/schemas by scripts/generate-schemas.sh. Do not edit." \
  --output gembaleap_agents/schemas.py
