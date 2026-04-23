import type { Task, Agent } from '@/types'

/**
 * Enriches a single task with assignee agent data (names, emojis, roles)
 */
export function enrichTaskWithAssignees(task: Task, agents: Agent[]): Task {
  const assignees = (task.assignee_ids || [])
    .map(id => agents.find(a => a.id === id))
    .filter((agent): agent is Agent => agent !== undefined)
    .map(agent => ({
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      role: agent.role,
    }))

  // Populate assignee_names from assignees if not already set
  const assignee_names = assignees.map(a => a.name)

  return {
    ...task,
    assignees,
    assignee_names: assignee_names.length > 0 ? assignee_names : (task.assignee_names || []),
  }
}

/**
 * Enriches multiple tasks with assignee agent data
 */
export function enrichTasksWithAssignees(tasks: Task[], agents: Agent[]): Task[] {
  return tasks.map(task => enrichTaskWithAssignees(task, agents))
}

/**
 * Gets assignee names for a task as a comma-separated string
 */
export function getAssigneeNames(task: Task): string {
  // Use enriched assignees first, then fall back to assignee_names from database
  if (task.assignees && task.assignees.length > 0) {
    return task.assignees.map(a => a.name).join(', ')
  }
  if (task.assignee_names && task.assignee_names.length > 0) {
    return task.assignee_names.join(', ')
  }
  return 'Unassigned'
}

/**
 * Gets assignee emojis for a task with optional limiting
 */
export function getAssigneeEmojis(task: Task, limit?: number): string {
  if (!task.assignees || task.assignees.length === 0) {
    return '👤'
  }
  const emojis = task.assignees.map(a => a.emoji)
  return limit ? emojis.slice(0, limit).join('') : emojis.join('')
}
