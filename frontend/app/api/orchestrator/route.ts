import { NextResponse } from 'next/server'

const DEFAULT_N8N_ORIGIN = 'https://cardial.kutraa.com'
const DEFAULT_WEBHOOK_PATHS = ['OpenClueActions', 'mission-control-actions']

function normalizeOrigin(value?: string) {
  if (!value) return DEFAULT_N8N_ORIGIN

  return value
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v\d+$/, '')
}

function buildWebhookUrl(origin: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path

  const cleanOrigin = normalizeOrigin(origin)
  const cleanPath = path.replace(/^\/+/, '').replace(/^webhook\//, '')
  return `${cleanOrigin}/webhook/${cleanPath}`
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function getWebhookCandidates() {
  const explicitUrl = process.env.N8N_WEBHOOK_URL?.trim()
  if (explicitUrl) return [explicitUrl]

  const origin = normalizeOrigin(process.env.N8N_BASE_URL || process.env.N8N_API_URL)
  const explicitPath = process.env.N8N_WEBHOOK_PATH?.trim()
  const paths = explicitPath ? [explicitPath] : DEFAULT_WEBHOOK_PATHS

  return unique(paths.map((path) => buildWebhookUrl(origin, path)))
}

function pathOnly(url: string) {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function parseJson(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function parseN8nHint(body: any) {
  if (!body) return null
  if (typeof body.hint === 'string') return body.hint
  if (typeof body.message === 'string') return body.message
  if (typeof body.error === 'string') return body.error
  return null
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const webhookCandidates = getWebhookCandidates()
    const attemptedPaths = webhookCandidates.map(pathOnly)

    for (let index = 0; index < webhookCandidates.length; index += 1) {
      const webhookUrl = webhookCandidates[index]
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const rawData = await response.text()

      if (response.ok) {
        const data = parseJson(rawData)
        return NextResponse.json(data ?? { message: rawData || 'Success' })
      }

      if (response.status === 404 && index < webhookCandidates.length - 1) {
        console.warn(`[Next.js API] n8n webhook ${pathOnly(webhookUrl)} returned 404. Trying next production candidate...`)
        continue
      }

      const errorJson = parseJson(rawData)
      const n8nHint = parseN8nHint(errorJson)
      const inactiveWebhookHint =
        'n8n production webhook was not found. Activate the workflow, verify the POST webhook path, or set N8N_WEBHOOK_URL/N8N_WEBHOOK_PATH to the active production webhook. Do not use webhook-test for normal frontend traffic.'
      const hint = response.status === 404 ? inactiveWebhookHint : n8nHint
      const status = response.status === 404 ? 502 : response.status

      console.error(`[Next.js API] n8n returned status ${response.status} for ${pathOnly(webhookUrl)}`)

      return NextResponse.json(
        {
          error: `Orchestrator failed with status ${response.status}`,
          upstream_status: response.status,
          hint,
          attempted_paths: attemptedPaths,
          n8n_response: errorJson ?? undefined,
          details: errorJson ? undefined : rawData,
        },
        { status }
      )
    }

    return NextResponse.json(
      {
        error: 'No n8n webhook candidates configured',
        hint: 'Set N8N_WEBHOOK_URL or N8N_WEBHOOK_PATH for the production n8n webhook.',
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('[Next.js API] Proxy error:', error)
    return NextResponse.json({ error: error.message || 'Internal Proxy Error' }, { status: 500 })
  }
}
