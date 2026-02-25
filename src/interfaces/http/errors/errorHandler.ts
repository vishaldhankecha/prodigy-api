import type { FastifyInstance } from 'fastify';
import { AppError } from '../../../application/errors/AppError';

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        message: error.message,
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      message: 'Internal Server Error',
    });
  });
};
