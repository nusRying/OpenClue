import type { Agent, Project, Task, ActivityEvent } from '@/types'

// ─── Agent ─────────────────────────────────────────────────────────────────

export type AgentStatus = 'online' | 'idle' | 'offline'

export function getAgentStatus(lastSeenAt: string | null): AgentStatus {
  if (!lastSeenAt) return 'offline'
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  const mins = diff / 60000
  if (mins <= 5) return 'online'
  if (mins <= 30) return 'idle'
  return 'offline'
}

export const AGENT_STATUS_CONFIG: Record<AgentStatus, { label: string; color: string }> = {
  online: { label: 'Online', color: 'var(--status-online)' },
  idle: { label: 'Idle', color: 'var(--status-idle)' },
  offline: { label: 'Offline', color: 'var(--status-offline)' },
}

// ─── Project ───────────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'var(--success)' },
  paused: { label: 'Paused', color: 'var(--warning)' },
  completed: { label: 'Done', color: 'var(--info)' },
  archived: { label: 'Archived', color: 'var(--text-tertiary)' },
}

// ─── Task ───────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'var(--priority-low)',
  'in-progress': 'var(--info)',
  completed: 'var(--success)',
  blocked: 'var(--error)',
}

export const TASK_STATUS_BADGE: Record<TaskStatus, { bg: string; color: string; border: string }> = {
  pending: { bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: 'var(--border-default)' },
  'in-progress': { bg: 'var(--status-in-progress-bg)', color: 'var(--info)', border: 'var(--status-in-progress-border)' },
  completed: { bg: 'var(--success-muted)', color: 'var(--success)', border: 'var(--status-completed-border)' },
  blocked: { bg: 'var(--error-muted)', color: 'var(--error)', border: 'var(--status-blocked-border)' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'var(--priority-low)', bg: 'var(--priority-low-bg)' },
  medium: { label: 'Medium', color: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)' },
  high: { label: 'High', color: 'var(--priority-high)', bg: 'var(--priority-high-bg)' },
  critical: { label: 'Critical', color: 'var(--priority-critical)', bg: 'var(--priority-critical-bg)' },
}

export function isTaskOverdue(task: Task): boolean {
  return !!task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
}

// ─── Activity ───────────────────────────────────────────────────────────────

export type EventType = 'agent_status' | 'task_created' | 'task_updated' | 'task_assigned' | 'project_updated' | 'message:received' | 'message:sent' | 'message:preprocessed' | 'tool_start' | 'tool_end' | 'session_event' | 'session_error'

export const EVENT_CONFIG: Record<string, { color: string; bgColor: string; icon: string; label?: string }> = {
  agent_status: { color: 'var(--info)', bgColor: 'var(--info-muted)', icon: '●', label: 'Status' },
  task_created: { color: 'var(--success)', bgColor: 'var(--success-muted)', icon: '+', label: 'Created' },
  task_updated: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: '↺', label: 'Updated' },
  task_assigned: { color: 'var(--accent-purple)', bgColor: 'var(--accent-purple-muted)', icon: '→', label: 'Assigned' },
  project_updated: { color: 'var(--accent-teal)', bgColor: 'var(--accent-teal-muted)', icon: '◆', label: 'Project' },
  'message:received': { color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: '↓', label: 'In' },
  'message:sent': { color: 'var(--accent-purple)', bgColor: 'var(--accent-purple-muted)', icon: '↑', label: 'Out' },
  'message:preprocessed': { color: 'var(--accent-teal)', bgColor: 'var(--accent-teal-muted)', icon: '→', label: 'Preprocess' },
  tool_start: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-elevated)', icon: '▶', label: 'Tool' },
  tool_end: { color: 'var(--accent-orange)', bgColor: 'var(--accent-orange-muted)', icon: '■', label: 'Tool' },
  session_event: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-elevated)', icon: '●', label: 'Event' },
  session_error: { color: 'var(--error)', bgColor: 'var(--error-muted)', icon: '!', label: 'Error' },
}

// ─── Task Board Columns ─────────────────────────────────────────────────────

export const TASK_COLUMNS: { id: TaskStatus; label: string; dotColor: string; colBg: string; colBorder: string }[] = [
  { id: 'pending', label: 'To do', dotColor: 'var(--priority-low)', colBg: 'var(--col-pending)', colBorder: 'var(--border-subtle)' },
  { id: 'in-progress', label: 'In progress', dotColor: 'var(--info)', colBg: 'var(--col-in-progress)', colBorder: 'var(--col-in-progress-border)' },
  { id: 'completed', label: 'Done', dotColor: 'var(--success)', colBg: 'var(--col-done)', colBorder: 'var(--col-done-border)' },
  { id: 'blocked', label: 'Blocked', dotColor: 'var(--error)', colBg: 'var(--col-blocked)', colBorder: 'var(--col-blocked-border)' },
]
