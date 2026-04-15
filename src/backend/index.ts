import Fastify, { type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { webhooksRouter } from './routes/webhooks.js';
import { liveRouter } from './routes/live.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function build() {
  const fastify = Fastify({
    logger: true,
  });

  // Plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(sensible);

  // ─── Health check ────────────────────────────────────────────────────────────
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mission-control-backend',
  }));

  // ─── API Routes ──────────────────────────────────────────────────────────────
  await fastify.register(webhooksRouter, { prefix: '/api/webhook' });
  await fastify.register(liveRouter, { prefix: '/api/v1/live' });

  return fastify;
}

build().then(async (fastify) => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Mission Control Backend running on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
