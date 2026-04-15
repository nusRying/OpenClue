export type AgentStatus = "online" | "idle" | "busy" | "offline";
export type ProjectStatus = "active" | "paused" | "completed" | "archived";
export type TaskStatus = "pending" | "in-progress" | "completed" | "blocked";
export type Priority = "low" | "medium" | "high" | "critical";
export type EventType = "agent_status" | "task_updated" | "task_created" | "task_assigned" | "project_updated" | "tool_start" | "tool_end" | "session_event";

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: AgentStatus;
  bot_username: string;
  workspace_path: string;
  last_heartbeat: string;
  current_task?: string;
  skills: string[];
  memory: { has_memory_md: boolean };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner_agent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee_id?: string;
  due_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: string;
  event_type: EventType;
  message: string;
  agent_id?: string;
  project_id?: string;
  task_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DashboardSnapshot {
  agents: Agent[];
  projects: Project[];
  tasks: Task[];
  recentActivity: ActivityEvent[];
  timestamp: string;
}
