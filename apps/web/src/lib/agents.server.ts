import type { z } from 'zod'
import { AppError } from './app-error'

export function agentsConfigured(): boolean {
  return Boolean(process.env.AGENTS_BASE_URL)
}

/**
 * Calls the ADK agent service. On Cloud Run the request must carry an ID token
 * minted for the agents service audience (service-to-service auth); add it here
 * when the service is deployed.
 */
export async function callAgent<T>(
  path: string,
  tenantId: string,
  payload: Record<string, unknown>,
  schema: z.ZodType<T>,
): Promise<T> {
  const base = process.env.AGENTS_BASE_URL
  if (!base) throw new AppError('AGENT_UNAVAILABLE', 'AGENTS_BASE_URL not set')
  const response = await fetch(new URL(path, base), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tenantId, payload }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new AppError('AGENT_UNAVAILABLE', `${path} ${response.status}`)
  return schema.parse(await response.json())
}
