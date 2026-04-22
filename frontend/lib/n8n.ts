import { supabase } from './supabase'

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678/webhook'

// Map agent names (from DB) to n8n webhook paths as per the transcript
const AGENT_WEBHOOK_MAPPING: Record<string, string> = {
  'Promo': 'n8n/promo',
  'Digit': 'n8n/digit',
  'String': 'n8n/string',
  'Mehzam': 'n8n/main', // or main/main based on config
}

export async function triggerN8nWebhook(taskId: string, eventType: 'create' | 'update' | 'status_change') {
  try {
    // 1. Fetch task details with project and assignee info
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (name, description),
        agents:assignee_id (id, name, emoji)
      `)
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error('[n8n] Failed to fetch task details for webhook:', taskError)
      return
    }

    const agentName = task.agents?.name || 'Main'
    const webhookPath = AGENT_WEBHOOK_MAPPING[agentName] || 'n8n/main'
    const url = `${N8N_BASE_URL}/${webhookPath}`

    console.log(`[n8n] Triggering webhook for agent ${agentName} at ${url}`)

    // 2. Prepare payload exactly as expected by the n8n "Mission Control" system
    const payload = {
      event: eventType,
      task_id: task.id,
      task_title: task.title,
      task_description: task.description,
      task_status: task.status,
      task_priority: task.priority,
      project_name: task.projects?.name,
      agent_id: task.assignee_id,
      agent_name: agentName,
      session_key: `agent:${agentName.toLowerCase()}:task:${task.id}`, // Custom session key logic from video
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status ${response.status}`)
    }

    console.log(`[n8n] Webhook for ${agentName} triggered successfully`)
    return await response.json()
  } catch (error) {
    console.error('[n8n] Webhook error:', error)
  }
}
