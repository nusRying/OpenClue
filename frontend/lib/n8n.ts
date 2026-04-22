import { supabase } from './supabase'

import mappingsData from './mappings.json'

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678/webhook'

// Map agent names to their configurations dynamically from mappings.json
function getAgentConfig(agentName: string) {
  const nameLower = agentName.toLowerCase()
  // "Mehzam" is the CEO/Main agent, usually mapped to 'main' or similar
  const searchId = nameLower === 'mehzam' ? 'main' : nameLower
  
  const mapping = mappingsData.hooks.mappings.find((m: any) => 
    m.agentId === searchId || m.id.includes(searchId)
  )

  if (mapping) {
    return {
      path: mapping.match.path,
      sessionKey: mapping.sessionKey,
      to: mapping.to
    }
  }

  // Default fallback (usually the main agent)
  const defaultMapping = mappingsData.hooks.mappings.find((m: any) => m.agentId === 'main') || mappingsData.hooks.mappings[0]
  return {
    path: defaultMapping.match.path,
    sessionKey: defaultMapping.sessionKey,
    to: defaultMapping.to
  }
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

    const agentName = task.agents?.name || 'Mehzam'
    const config = getAgentConfig(agentName)
    
    // Construct the URL following the /hooks prefix from client json
    const url = `${N8N_BASE_URL}/${config.path}`

    console.log(`[n8n] Triggering webhook for agent ${agentName} at ${url}`)

    // 2. Prepare payload matching client requirement (respond in this telegram ID and topic)
    const payload = {
      message: `Task ${eventType.toUpperCase()}: ${task.title}\nStatus: ${task.status}\nDescription: ${task.description || 'N/A'}\nProject: ${task.projects?.name}`,
      sessionKey: config.sessionKey,
      to: config.to,
      channel: 'telegram',
      metadata: {
        task_id: task.id,
        project_id: task.project_id,
        event: eventType,
        timestamp: new Date().toISOString()
      }
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
