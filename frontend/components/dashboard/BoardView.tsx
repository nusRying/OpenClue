'use client'

import type { Agent, Project, Task, ActivityEvent } from '@/types'
import { AgentCard } from '@/components/agents/AgentCard'
import { ProjectsPanel } from '@/components/projects/ProjectsPanel'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { useCreateProject, useUpdateProject, useDeleteProject, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from '@/hooks'
import { useCallback } from 'react'

interface Props {
  projects: Project[]
  tasks: Task[]
  agents: Agent[]
  activity: ActivityEvent[]
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
  overviewMode?: boolean
}

export function BoardView({ projects, tasks, agents, activity, selectedProjectId, onSelectProject, overviewMode = false }: Props) {
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const updateTaskStatus = useUpdateTaskStatus()

  const onlineAgents = agents.filter(a => {
    if (!a.last_seen_at) return false
    return (Date.now() - new Date(a.last_seen_at).getTime()) < 5 * 60 * 1000
  }).length

  const handleStatusChange = useCallback((taskId: string, newStatus: string) => {
    updateTaskStatus.mutate({ id: taskId, status: newStatus })
  }, [updateTaskStatus])

  const handleCreateProject = useCallback((project: Partial<Project>) => {
    createProject.mutate(project)
  }, [createProject])

  const handleUpdateProject = useCallback((project: { id: string } & Partial<Project>) => {
    updateProject.mutate(project)
  }, [updateProject])

  const handleDeleteProject = useCallback((id: string) => {
    deleteProject.mutate(id)
    if (selectedProjectId === id) onSelectProject(null)
  }, [deleteProject, selectedProjectId, onSelectProject])

  const handleCreateTask = useCallback((task: Partial<Task>) => {
    createTask.mutate(task)
  }, [createTask])

  const handleUpdateTask = useCallback((task: { id: string } & Partial<Task>) => {
    updateTask.mutate(task)
  }, [updateTask])

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask.mutate(id)
  }, [deleteTask])

  if (overviewMode) {
    return (
      <DashboardOverview
        agents={agents}
        projects={projects}
        tasks={tasks}
      />
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
      
      {/* Main content (Left) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Projects */}
        <div className="card" style={{ padding: '1rem' }}>
          <ProjectsPanel
            projects={projects}
            agents={agents}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onSelectProject={onSelectProject}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Tasks */}
        <div className="card" style={{ padding: '1rem' }}>
          <TaskBoard
            tasks={tasks}
            projects={projects}
            agents={agents}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            selectedProjectId={selectedProjectId}
          />
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '5.5rem' }}>

        {/* Agents */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Agents</span>
              <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{agents.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              {onlineAgents} online
            </div>
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Recent Activity</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <ActivityFeed events={activity.slice(0, 20)} compact />
          </div>
        </div>
      </div>

    </div>
  )
}
