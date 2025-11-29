import { defineConfig } from '@mikro-orm/postgresql';
import { config as loadEnv } from 'dotenv';

loadEnv();

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  driverOptions: {
    connection: {
      ssl: { rejectUnauthorized: false },
    },
  },
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
  schemaGenerator: {
    ignoreSchema: ['auth', 'storage', 'realtime', 'vault'],
  },
});
