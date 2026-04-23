import { supabase } from './supabase'
import mappingsData from './mappings.json'

const N8N_BASE_URL = 'https://cardial.kutraa.com/webhook'

/**
 * Maps agent names to their configurations dynamically.
 */
function getAgentConfig(agentName: string) {
  const nameLower = agentName.toLowerCase()
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

  const defaultMapping = mappingsData.hooks.mappings.find((m: any) => m.agentId === 'main') || mappingsData.hooks.mappings[0]
  return {
    path: defaultMapping.match.path,
    sessionKey: defaultMapping.sessionKey,
    to: defaultMapping.to
  }
}

  /**
   * The Master Signal Router.
   * Sends an action intent to the n8n Master Orchestrator.
   */
  export async function triggerOpenClueAction(action: string, payload: any = {}, metadata: any = {}, priority: 'low' | 'medium' | 'high' = 'medium') {
    try {
      const url = `${N8N_BASE_URL}/mission-control-actions`
      
      // Resolve agent config if an agentId is provided
      let agentConfig = {}
      if (metadata.agentId || metadata.agent_id) {
        const targetId = metadata.agentId || metadata.agent_id
        const { data: agent } = await supabase.from('agents').select('name').eq('id', targetId).single()
        if (agent) {
          const config = getAgentConfig(agent.name)
          agentConfig = {
            sessionKey: config.sessionKey,
            to: config.to,
            channel: 'telegram'
          }
        }
      }
  
      const finalPayload = {
        action,
        priority, // Intelligence priority
        ...payload,
        metadata: {
          ...metadata,
          ...agentConfig,
          timestamp: new Date().toISOString(),
          origin: 'frontend-orchestrator'
        }
      }

    console.log(`[n8n] Triggering Master Action: ${action}`, finalPayload)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    })

    if (!response.ok) throw new Error(`Action ${action} failed with status ${response.status}`)
    
    return await response.json()
  } catch (error) {
    console.error(`[n8n] Orchestration Error (${action}):`, error)
    return null
  }
}

/**
 * Convienence wrapper for task-related orchestration.
 */
export async function triggerTaskAction(taskId: string, eventType: string, priority: 'low' | 'medium' | 'high' = 'medium') {
  return triggerOpenClueAction(`task:${eventType}`, {}, { task_id: taskId }, priority)
}

/**
 * Convienence wrapper for project broadcasts.
 */
export async function broadcastAgentSignal(agentIds: string[], message: string, projectId: string, priority: 'medium' | 'high' = 'medium') {
  return triggerOpenClueAction('broadcast', { message }, { agent_ids: agentIds, project_id: projectId }, priority)
}

/**
 * End a session and trigger autonomous summarization.
 */
export async function endAgentSession(sessionKey: string, agentId: string) {
  return triggerOpenClueAction('session_end', {}, { sessionKey, agentId }, 'low')
}
