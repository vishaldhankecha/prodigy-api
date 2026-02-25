# Prodigy Programs API

REST API for day-wise wellness activities, built with Node.js, TypeScript, Fastify, MySQL, and Prisma using Clean Architecture.

## Tech Stack

- Node.js 20+
- TypeScript
- Fastify
- MySQL 8 (Docker)
- Prisma 7 + `@prisma/adapter-mariadb`
- Zod
- Jest

## Project Structure

```text
src/
├── domain/
│   ├── entities/
│   └── repositories/
├── application/
│   ├── errors/
│   └── usecases/
├── infrastructure/
│   ├── database/
│   └── repositories/
├── interfaces/http/
│   ├── errors/
│   ├── plugins/
│   ├── routes/
│   └── validation/
├── config/
└── main.ts
```

## API Endpoints

- `GET /health`
- `GET /programs/:programId/days/:day?userId=1`
- `GET /programs/:programId/weeks/:weekNumber?userId=1`
- `PATCH /activities/:id/complete`

`GET /programs/:programId/days/:day` returns schedule-aware activity rows with:
- `category`
- `frequency`
- `frequencyLabel`
- `timeMode`
- `timeLabel`
- `suggestedDurationSec`
- `plannedOccurrences`
- `completedOccurrences`
- `remainingActivitiesCount`
- `remainingOccurrences`

PATCH body:

```json
{
  "userId": 1
}
```

Important:
- `:id` in `PATCH /activities/:id/complete` is the `DayPlanActivity.id` (the scheduled activity id for that day), returned by the day endpoint.
- `userId` must be actively enrolled in the requested program (`ProgramEnrollment.status = ACTIVE`), otherwise the API returns `403`.
- Scheduling is rule-driven via `ActivityScheduleRule` (`DAILY` / `WEEKLY` + occurrences + weekly day pattern).
- After editing rules, regenerate materialized day schedules with `npm run schedule:regenerate -- --programId=1`.

Swagger UI:

- `GET /docs`

## Environment Variables

Create `.env` with:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://appuser:apppassword@127.0.0.1:3307/prodigy"
SHADOW_DATABASE_URL="mysql://root:rootpassword@127.0.0.1:3307/prodigy_shadow"
```

## Scripts

- `npm run dev`: run API in development mode
- `npm run build`: compile TypeScript
- `npm run start`: run compiled app from `dist/`
- `npm test`: run unit tests
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate`: apply checked-in migrations (non-interactive)
- `npm run prisma:migrate:dev`: create/apply a new migration in local development
- `npm run seed`: seed sample data
- `npm run schedule:regenerate`: rebuild `DayPlanActivity` from `ActivityScheduleRule`
- `npm run db:up`: start MySQL + Adminer with Docker
- `npm run db:down`: stop Docker services
- `npm run db:reset`: recreate containers and volumes

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start database:

```bash
npm run db:up
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migrations:

```bash
npm run prisma:migrate
```

5. Seed data:

```bash
npm run seed
```

6. Start API:

```bash
npm run dev
```

Server URL:

- `http://127.0.0.1:3000`

## Quick Route Test

```bash
curl -i http://127.0.0.1:3000/health
curl -i "http://127.0.0.1:3000/programs/1/days/1?userId=1"
curl -i -X PATCH http://127.0.0.1:3000/activities/1/complete -H "content-type: application/json" -d '{"userId":1}' # replace 1 with a DayPlanActivity id from day response
curl -i "http://127.0.0.1:3000/programs/1/weeks/1?userId=1"
```

## Notes

- MySQL is exposed on host port `3307` to avoid conflicts with local MySQL on `3306`.
- Prisma migrate uses `SHADOW_DATABASE_URL`.
- `npm run seed` resets and re-inserts seed data.
