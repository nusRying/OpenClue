import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import getSupabase from '../lib/supabase.js';
import type { Agent, Project, Task, ActivityEvent } from '../src/types.js';

function getMissingColumn(error: { code?: string; message?: string } | null): string | null {
  if (!error || error.code !== 'PGRST204') return null;
  const match = String(error.message || '').match(/'([^']+)'/);
  return match?.[1] || null;
}

export async function liveRouter(fastify: FastifyInstance) {
  const supabase = getSupabase();

  // ─── GET /api/v1/live ────────────────────────────────────────────────────────
  // Full dashboard snapshot for initial load
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const [agentsResult, projectsResult, tasksResult, activityResult] = await Promise.all([
      supabase.from('agents').select('*').order('name'),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (agentsResult.error || projectsResult.error || tasksResult.error || activityResult.error) {
      console.error('[Live] Query error:', {
        agents: agentsResult.error,
        projects: projectsResult.error,
        tasks: tasksResult.error,
        activity: activityResult.error,
      });
      return reply.status(500).send({ error: 'Failed to fetch dashboard data' });
    }

    return {
      agents: (agentsResult.data || []) as Agent[],
      projects: (projectsResult.data || []) as Project[],
      tasks: (tasksResult.data || []) as Task[],
      recentActivity: (activityResult.data || []) as ActivityEvent[],
      timestamp: new Date().toISOString(),
    };
  });

  // ─── GET /api/v1/live/agents ────────────────────────────────────────────────
  fastify.get('/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('name');

    if (error) return reply.status(500).send({ error: error.message });
    return { agents: data };
  });

  // ─── GET /api/v1/live/projects ──────────────────────────────────────────────
  fastify.get('/projects', async (request: FastifyRequest, reply: FastifyReply) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return reply.status(500).send({ error: error.message });
    return { projects: data };
  });

  // ─── GET /api/v1/live/tasks ─────────────────────────────────────────────────
  fastify.get('/tasks', async (request: FastifyRequest<{ Querystring: { project_id?: string; assignee_id?: string; status?: string } }>, reply: FastifyReply) => {
    const { project_id, assignee_id, status } = request.query;
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (project_id) query = query.eq('project_id', project_id);
    if (assignee_id) query = query.contains('assignee_ids', [assignee_id]);
    if (status) query = query.eq('status', status);

    let { data, error } = await query;

    // Fallback to legacy schema when assignee_ids does not exist.
    if (error?.code === 'PGRST204' && String(error.message || '').includes("'assignee_ids'")) {
      let fallbackQuery = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (project_id) fallbackQuery = fallbackQuery.eq('project_id', project_id);
      if (assignee_id) fallbackQuery = fallbackQuery.like('agent_id', `%${assignee_id}%`);
      if (status) fallbackQuery = fallbackQuery.eq('status', status);
      const fallback = await fallbackQuery;
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return reply.status(500).send({ error: error.message });
    return { tasks: data };
  });

  // ─── PATCH /api/v1/live/tasks/:id ────────────────────────────────────────────
  // Update a task (status, priority, title, etc.)
  fastify.patch<{ Params: { id: string }; Body: Partial<Task> }>('/tasks/:id', async (request, reply) => {
    const { id } = request.params
    const updates = request.body as Partial<Task> & { assignee_ids?: string[]; agent_id?: string }

    // Always update updated_at
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const payload: Record<string, unknown> = { ...updatesWithTimestamp };
    let updated: Task | null = null;
    let updateError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      updated = result.data as Task | null;
      updateError = result.error;

      if (!updateError) break;

      const missingColumn = getMissingColumn(updateError);
      if (!missingColumn) break;

      if (missingColumn === 'assignee_ids') {
        const assigneeIds = Array.isArray(updates.assignee_ids) ? updates.assignee_ids : [];
        payload.agent_id = assigneeIds.join(',');
      }

      delete payload[missingColumn];
    }

    if (updateError) {
      console.error('[Live] Task update error:', updateError)
      return reply.status(500).send({ error: updateError.message })
    }

    if (!updated) {
      return reply.status(404).send({ error: 'Task not found' })
    }

    // Log status changes to activity_log
    if (updates.status && updates.status !== updated.status) {
      await supabase.from('activity_log').insert({
        event_type: 'task_updated',
        description: `Task status changed to "${updates.status}"`,
        metadata: { previous_status: updated.status, new_status: updates.status },
      })
    }

    return { task: updated }
  })

  // ─── GET /api/v1/live/activity ───────────────────────────────────────────────
  fastify.get('/activity', async (request: FastifyRequest<{ Querystring: { limit?: string; event_type?: string } }>, reply: FastifyReply) => {
    const limit = parseInt(request.query.limit || '50', 10);
    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (request.query.event_type) {
      query = query.eq('event_type', request.query.event_type);
    }

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });
    return { activity: data };
  });
}
