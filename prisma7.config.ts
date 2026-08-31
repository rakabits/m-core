import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/** Prisma 7 datasource configuration. */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
