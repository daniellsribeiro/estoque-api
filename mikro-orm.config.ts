// mikro-orm.config.ts
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  entities: [],
  dbName: '', // será inferido da DATABASE_URL
  clientUrl: process.env.DATABASE_URL,
  driverOptions: {
    connection: {
      ssl: { rejectUnauthorized: false }, // supabase geralmente precisa disso
    },
  },
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
});
