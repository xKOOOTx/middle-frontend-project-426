import { Hono } from 'hono';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';

const categoriesRoute = new Hono();

categoriesRoute.get('/', async (c) => {
    const rows = await db.select().from(categories);
    return c.json(rows, 200);
});

export { categoriesRoute };
