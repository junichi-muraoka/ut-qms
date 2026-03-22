import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getLocalDb } from './index.ts';

async function main() {
  console.log('Running migrations...');
  const db = await getLocalDb();
  // @ts-ignore - Drizzle typed migrator can be tricky with dynamic DBs
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
