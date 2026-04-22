import { supabase } from './supabase'

import mappingsData from './mappings.json'

const N8N_BASE_URL = 'https://cardial.kutraa.com/webhook'

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
    // 1. Fetch task details with project info
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (name, description)
      `)
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error('[n8n] Failed to fetch task details for webhook:', taskError)
      return
    }

    // Fetch details for all assigned agents
    const { data: assignedAgents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, emoji')
      .in('id', task.assignee_ids || [])

    if (agentsError) {
      console.error('[n8n] Failed to fetch assigned agents details:', agentsError)
    }

    const agentsList = assignedAgents || []
    const mainAgent = agentsList[0] || { name: 'Mehzam' }
    const config = getAgentConfig(mainAgent.name)
    
    // Unified URL as per client's recommendation for "one mapping"
    const url = `${N8N_BASE_URL}/mission-control-webhook`

    console.log(`[n8n] Triggering unified webhook for agents ${agentsList.map(a => a.name).join(', ')} at ${url}`)

    // 2. Prepare payload matching the updated n8n JSON
    const payload = {
      message: `Task ${eventType.toUpperCase()}: ${task.title}\nStatus: ${task.status}\nDescription: ${task.description || 'N/A'}\nProject: ${task.projects?.name}\nAssignees: ${agentsList.map(a => `${a.emoji} ${a.name}`).join(', ')}`,
      sessionKey: config.sessionKey,
      to: config.to,
      channel: 'telegram',
      agentId: mainAgent.id, // For routing in n8n if needed
      metadata: {
        task_id: task.id,
        project_id: task.project_id,
        assignee_ids: task.assignee_ids,
        event: eventType,
        agent_id: mainAgent.name.toLowerCase(), // Following client's lowercase naming
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

    console.log(`[n8n] Unified webhook for ${mainAgent.name} triggered successfully`)
    return await response.json()
  } catch (error) {
    console.error('[n8n] Webhook error:', error)
  }
}
