import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient | null = null;

const parseMysqlUrl = (databaseUrl: string) => {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
  };
};

export const getPrisma = (): PrismaClient => {
  if (prismaClient) {
    return prismaClient;
  }

  const databaseUrl = process.env.DATABASE_URL;

  // Preferred path for local MySQL: Prisma adapter + mariadb driver.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required when using @prisma/adapter-mariadb.');
    }

    const config = parseMysqlUrl(databaseUrl);
    prismaClient = new PrismaClient({
      adapter: new PrismaMariaDb({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 10,
      acquireTimeout: 10000,
      connectTimeout: 10000,
      }),
    });
    return prismaClient;
  } catch (error) {
    const moduleNotFound = error instanceof Error && /Cannot find module/.test(error.message);
    if (!moduleNotFound) {
      throw error;
    }
  }

  // Secondary path: Prisma Accelerate (cloud).
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
  if (accelerateUrl) {
    prismaClient = new PrismaClient({ accelerateUrl });
    return prismaClient;
  }

  throw new Error(
    'Prisma runtime is not configured. Run: npm i @prisma/adapter-mariadb mariadb, then restart the server. Alternatively set PRISMA_ACCELERATE_URL.',
  );

};
