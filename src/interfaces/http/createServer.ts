import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { registerErrorHandler } from './errors/errorHandler';
import { registerActivityRoutes } from './routes/activityRoutes';
import { registerProgramRoutes } from './routes/programRoutes';
import { registerDocs } from './plugins/docs';

export const createServer = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await registerDocs(app);

  app.get('/health', {
    schema: {
      tags: ['System'],
      summary: 'Health check',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
          required: ['status'],
        },
      },
    },
  }, async () => ({ status: 'ok' }));

  await registerProgramRoutes(app);
  await registerActivityRoutes(app);

  registerErrorHandler(app);

  return app;
};
