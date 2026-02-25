import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { GetDayPlanUseCase } from '../../../application/usecases/GetDayPlanUseCase';
import { GetWeeklyOverviewUseCase } from '../../../application/usecases/GetWeeklyOverviewUseCase';
import { PrismaActivityProgressRepository } from '../../../infrastructure/repositories/PrismaActivityProgressRepository';
import { PrismaDayPlanRepository } from '../../../infrastructure/repositories/PrismaDayPlanRepository';
import { PrismaProgramEnrollmentRepository } from '../../../infrastructure/repositories/PrismaProgramEnrollmentRepository';
import { parseOrThrow } from '../validation/parse';

const dayParamsSchema = z.object({
  programId: z.coerce.number().int().positive(),
  day: z.coerce.number().int().min(1).max(30),
});

const weekParamsSchema = z.object({
  programId: z.coerce.number().int().positive(),
  weekNumber: z.coerce.number().int().min(1).max(5),
});

const querySchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const registerProgramRoutes = async (app: FastifyInstance): Promise<void> => {
  const dayPlanRepository = new PrismaDayPlanRepository();
  const activityProgressRepository = new PrismaActivityProgressRepository();
  const programEnrollmentRepository = new PrismaProgramEnrollmentRepository();
  const getDayPlanUseCase = new GetDayPlanUseCase(
    dayPlanRepository,
    activityProgressRepository,
    programEnrollmentRepository,
  );
  const getWeeklyOverviewUseCase = new GetWeeklyOverviewUseCase(
    dayPlanRepository,
    activityProgressRepository,
    programEnrollmentRepository,
  );

  app.get('/programs/:programId/days/:day', {
    schema: {
      tags: ['Programs'],
      summary: 'Get day-wise schedule for a program',
      params: {
        type: 'object',
        properties: {
          programId: { type: 'integer', minimum: 1 },
          day: { type: 'integer', minimum: 1, maximum: 30 },
        },
        required: ['programId', 'day'],
      },
      querystring: {
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
            programId: { type: 'integer' },
            day: { type: 'integer' },
            title: { type: 'string' },
            completionPercentage: { type: 'integer' },
            activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer', description: 'DayPlanActivity id' },
                  activityId: { type: 'integer' },
                  title: { type: 'string' },
                  category: { type: 'string' },
                  frequency: { type: 'string' },
                  timeMode: { type: 'string' },
                  suggestedDurationSec: { type: 'integer' },
                  plannedOccurrences: { type: 'integer' },
                  completedOccurrences: { type: 'integer' },
                  completed: { type: 'boolean' },
                },
                required: [
                  'id',
                  'activityId',
                  'title',
                  'category',
                  'frequency',
                  'timeMode',
                  'suggestedDurationSec',
                  'plannedOccurrences',
                  'completedOccurrences',
                  'completed',
                ],
              },
            },
          },
          required: ['programId', 'day', 'title', 'completionPercentage', 'activities'],
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
    const params = parseOrThrow(dayParamsSchema, request.params);
    const query = parseOrThrow(querySchema, request.query);

    const result = await getDayPlanUseCase.execute({
      programId: params.programId,
      day: params.day,
      userId: query.userId,
    });

    reply.status(200).send(result);
  });

  app.get('/programs/:programId/weeks/:weekNumber', {
    schema: {
      tags: ['Programs'],
      summary: 'Get weekly overview for a program',
      params: {
        type: 'object',
        properties: {
          programId: { type: 'integer', minimum: 1 },
          weekNumber: { type: 'integer', minimum: 1, maximum: 5 },
        },
        required: ['programId', 'weekNumber'],
      },
      querystring: {
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
            programId: { type: 'integer' },
            weekNumber: { type: 'integer' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'integer' },
                  completionPercentage: { type: 'integer' },
                  activitiesPlanned: { type: 'integer' },
                  plannedOccurrences: { type: 'integer' },
                  completedOccurrences: { type: 'integer' },
                },
                required: [
                  'day',
                  'completionPercentage',
                  'activitiesPlanned',
                  'plannedOccurrences',
                  'completedOccurrences',
                ],
              },
            },
          },
          required: ['programId', 'weekNumber', 'days'],
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
      },
    },
  }, async (request, reply) => {
    const params = parseOrThrow(weekParamsSchema, request.params);
    const query = parseOrThrow(querySchema, request.query);

    const result = await getWeeklyOverviewUseCase.execute({
      programId: params.programId,
      weekNumber: params.weekNumber,
      userId: query.userId,
    });

    reply.status(200).send(result);
  });
};
