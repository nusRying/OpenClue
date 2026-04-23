import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Attempt Production Webhook first
    const prodUrl = 'https://cardial.kutraa.com/webhook/mission-control-actions'
    let response = await fetch(prodUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // If production is inactive (404), fallback to Test Webhook seamlessly
    if (response.status === 404) {
      console.warn('[Next.js API] Production webhook 404. Falling back to test webhook...')
      const testUrl = 'https://cardial.kutraa.com/webhook-test/mission-control-actions'
      response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    if (!response.ok) {
      console.error(`[Next.js API] n8n returned status ${response.status}`)
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json({ error: `Orchestrator failed with status ${response.status}`, n8n_response: errorJson }, { status: response.status })
      } catch {
        return NextResponse.json({ error: `Orchestrator failed with status ${response.status}`, details: errorText }, { status: response.status })
      }
    }

    // Try parsing as JSON, fallback to raw text if n8n responds with a simple OK
    const rawData = await response.text()
    try {
      const data = JSON.parse(rawData)
      return NextResponse.json(data)
    } catch {
      return NextResponse.json({ message: rawData || 'Success' })
    }
  } catch (error: any) {
    console.error('[Next.js API] Proxy error:', error)
    return NextResponse.json({ error: error.message || 'Internal Proxy Error' }, { status: 500 })
  }
}
