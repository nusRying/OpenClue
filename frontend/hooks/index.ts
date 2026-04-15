// ─── Data hooks ─────────────────────────────────────────────────────────────
export { useAgents, useCreateAgent, useUpdateAgent } from './features/useAgentQueries'
export { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from './features/useProjectQueries'
export { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from './features/useTaskQueries'
export { useActivity } from './features/useActivityQueries'

// ─── Realtime hooks ─────────────────────────────────────────────────────────
export {
  useRealtimeAgents,
  useRealtimeProjects,
  useRealtimeTasks,
  useRealtimeActivity,
} from './features/useRealtime'
