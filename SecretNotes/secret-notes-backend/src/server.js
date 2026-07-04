//Server wird gestartet
import { buildApp } from './app.js';
import 'dotenv/config';

const app = buildApp();

const port = Number(process.env.PORT) || 3000;

try {
  await app.listen({
    port,
    host: '0.0.0.0',
  });

  console.log(`Appl running on port ${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}