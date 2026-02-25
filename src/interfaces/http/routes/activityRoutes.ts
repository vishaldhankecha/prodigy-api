import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MarkActivityCompleteUseCase } from '../../../application/usecases/MarkActivityCompleteUseCase';
import { PrismaActivityProgressRepository } from '../../../infrastructure/repositories/PrismaActivityProgressRepository';
import { PrismaActivityRepository } from '../../../infrastructure/repositories/PrismaActivityRepository';
import { PrismaProgramEnrollmentRepository } from '../../../infrastructure/repositories/PrismaProgramEnrollmentRepository';
import { parseOrThrow } from '../validation/parse';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const registerActivityRoutes = async (app: FastifyInstance): Promise<void> => {
  const activityRepository = new PrismaActivityRepository();
  const activityProgressRepository = new PrismaActivityProgressRepository();
  const programEnrollmentRepository = new PrismaProgramEnrollmentRepository();
  const markActivityCompleteUseCase = new MarkActivityCompleteUseCase(
    activityRepository,
    activityProgressRepository,
    programEnrollmentRepository,
  );

  app.patch('/activities/:id/complete', {
    schema: {
      tags: ['Activities'],
      summary: 'Mark one occurrence complete for a scheduled day activity',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1, description: 'DayPlanActivity id' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          userId: { type: 'integer', minimum: 1 },
        },
        required: ['userId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            dayPlanActivityId: { type: 'integer' },
            userId: { type: 'integer' },
            completedOccurrence: { type: 'integer' },
            completedOccurrences: { type: 'integer' },
            plannedOccurrences: { type: 'integer' },
            completed: { type: 'boolean' },
            completedAt: { type: 'string', format: 'date-time' },
          },
          required: [
            'dayPlanActivityId',
            'userId',
            'completedOccurrence',
            'completedOccurrences',
            'plannedOccurrences',
            'completed',
            'completedAt',
          ],
        },
        400: {
          type: 'object',
          properties: { message: { type: 'string' } },
          required: ['message'],
        },
        403: {
          type: 'object',
          properties: { message: { type: 'string' } },
          required: ['message'],
        },
        404: {
          type: 'object',
          properties: { message: { type: 'string' } },
          required: ['message'],
        },
      },
    },
  }, async (request, reply) => {
    const params = parseOrThrow(paramsSchema, request.params);
    const body = parseOrThrow(bodySchema, request.body);

    const result = await markActivityCompleteUseCase.execute({
      dayPlanActivityId: params.id,
      userId: body.userId,
    });

    reply.status(200).send(result);
  });
};
