import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to run migrations');
  const ssl = process.env.DATABASE_SSL === 'true';

  const client = postgres(url, {
    ssl: ssl ? 'require' : false,
    max: 1,
    onnotice: () => {},
  });
  try {
    await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
    console.log('[migrate] migrations applied');
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
