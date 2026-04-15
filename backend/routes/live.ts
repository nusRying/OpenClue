import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import getSupabase from '../lib/supabase.js';
import type { Agent, Project, Task, ActivityEvent } from '../src/types.js';

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
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });

    const { project_id, assignee_id, status } = request.query;
    if (project_id) query = query.eq('project_id', project_id);
    if (assignee_id) query = query.eq('assignee_id', assignee_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return reply.status(500).send({ error: error.message });
    return { tasks: data };
  });

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
