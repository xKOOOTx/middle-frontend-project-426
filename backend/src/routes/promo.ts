import { Hono } from 'hono';
import { db } from '../db/index.js';
import { promoBlocks, products, categories } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const promoRoute = new Hono();

promoRoute.get('/', async (c) => {
    const rows = await db
        .select({
            id: promoBlocks.id,
            title: promoBlocks.title,
            text: promoBlocks.text,
            product: {
                id: products.id,
                slug: products.slug,
                name: products.name,
                price: products.price,
                categorySlug: categories.slug,
            }
        })
        .from(promoBlocks)
        .innerJoin(products, eq(promoBlocks.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))

    return c.json(rows, 200);
})

export { promoRoute }