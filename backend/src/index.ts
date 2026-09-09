import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db/index.js';
import { seed } from './db/seed.js'
import * as Sentry from '@sentry/node';
import { join } from 'node:path'

Sentry.init({
    dsn: process.env.SENTRY_DSN,
});

const app = new Hono();

// API-роуты собираем в отдельном под-приложении
const api = new Hono();

api.get('/debug-sentry', () => {
    throw new Error('My first backend Sentry error!')
})

api.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/api', api);

// Всё, что не подошло под известные /api/* маршруты — честный JSON 404
app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
    Sentry.captureException(err);
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

// Путь от текущего файла, а не от process.cwd() — так статика находится
// независимо от того, откуда запущен процесс (Docker, CI, локально).
const staticRoot = join(import.meta.dirname, '../../frontend/dist');

// Отдаём реальные файлы статики, если они существуют
app.use('/*', serveStatic({ root: staticRoot }));

// Всё остальное (клиентские роуты React) — отдаём index.html
app.get('*', serveStatic({ path: `${staticRoot}/index.html` }));

const port = Number(process.env.PORT) || 3000;

await migrate(db, { migrationsFolder: join(import.meta.dirname, '../drizzle') });

await seed();

serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server running on port ${info.port}`);
});