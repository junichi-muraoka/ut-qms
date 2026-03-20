import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.ts';

/**
 * For production using Cloudflare D1
 */
export const getProductionDb = (d1: D1Database) => {
  return drizzle(d1, { schema });
};

/**
 * For local development using better-sqlite3
 * We use dynamic imports to avoid loading these in the Worker environment
 */
export const getLocalDb = async () => {
  const { drizzle: drizzleLocal } = await import('drizzle-orm/better-sqlite3');
  // @ts-ignore
  const Database = (await import('better-sqlite3')).default;
  const sqlite = new Database('sqlite.db');
  return drizzleLocal(sqlite, { schema });
};
