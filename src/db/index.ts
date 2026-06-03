import { drizzle } from 'drizzle-orm/postgres-js';
import { relations } from './relations';

if (!process.env.DATABASE_URL) {
  throw new Error('no database?');
}

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  relations
});

export { db };

export * from './schema';
export * from './relations';
