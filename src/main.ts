import 'dotenv/config';
import { env } from './config/env';
import { createServer } from './interfaces/http/createServer';

const start = async (): Promise<void> => {
  const app = await createServer();

  try {
    await app.listen({
      host: '0.0.0.0',
      port: env.PORT,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
