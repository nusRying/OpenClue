import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    // Absolute proxy URL (Bypasses Browser CORS completely)
    const n8nUrl = 'https://cardial.kutraa.com/webhook/OpenClueActions'
    
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`[Next.js API] n8n returned status ${response.status}`)
      return NextResponse.json({ error: `Orchestrator failed with status ${response.status}` }, { status: response.status })
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
