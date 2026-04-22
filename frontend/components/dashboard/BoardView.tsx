'use client'

import type { Agent, Project, Task, ActivityEvent, TaskStatus } from '@/types'
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

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Top Section: Projects Discovery */}
      <section>
        <ProjectsPanel
          projects={projects}
          agents={agents}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={onSelectProject}
          selectedProjectId={selectedProjectId}
        />
      </section>

      {/* Middle Section: Task Management & Pulse */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Main Task Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
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

        {/* Sidebar: Pulse & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5.5rem' }}>
          
          {/* Recent Activity */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Terminal Activity</span>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ActivityFeed events={activity.slice(0, 20)} compact />
            </div>
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
               <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>MONITORING ACTIVE</span>
            </div>
          </div>

          {/* Online Agents List */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Agent Pulse</span>
                <span className="badge" style={{ background: 'var(--success-muted)', color: 'var(--success)' }}>
                  {agents.filter(a => a.status === 'online').length} LIVE
                </span>
              </div>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
