import { Hono } from 'hono';
import { and, eq, gte, lte, ilike, count } from 'drizzle-orm';
import { Value } from '@sinclair/typebox/value';
import { db } from '../db/index.js';
import { products, categories } from '../db/schema.js';
import { schema } from '../schema.js';

const productsRoute = new Hono();

const apiError = (code: string, message: string) => ({ code, message });

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

productsRoute.get('/', async (c) => {
    // c.req.query() отдаёт все параметры строкам — даже page=2 придёт как "2".
    // Прежде чем валидировать по схеме (которая ждёт настоящие number/boolean),
    // руками приводим типы только у тех полей, что вообще пришли.
    const raw = c.req.query();

    const query: Record<string, unknown> = {};
    if (raw.category !== undefined) query.category = raw.category;
    if (raw.search !== undefined) query.search = raw.search;
    if (raw.priceMin !== undefined) query.priceMin = Number(raw.priceMin);
    if (raw.priceMax !== undefined) query.priceMax = Number(raw.priceMax);
    if (raw.page !== undefined) query.page = Number(raw.page);
    if (raw.pageSize !== undefined) query.pageSize = Number(raw.pageSize);
    if (raw.available !== undefined) query.available = raw.available === 'true';

    // Схема параметров /api/products лежит не отдельным именованным компонентом
    // (как RegisterRequest), а вложенно — под args.query в самой schema.js.
    if (!Value.Check(schema['/api/products'].GET.args, { query })) {
        return c.json(apiError('VALIDATION_ERROR', 'Некорректные параметры фильтрации'), 400);
    }

    const page = (query.page as number) ?? DEFAULT_PAGE;
    const pageSize = (query.pageSize as number) ?? DEFAULT_PAGE_SIZE;

    // Фильтр по категории — сперва находим саму категорию по слагу.
    // Если такой категории вообще нет — сразу отдаём пустую выдачу,
    // не имеет смысла гонять запрос по несуществующему category_id.
    let categoryId: number | undefined;
    if (query.category !== undefined) {
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, query.category as string));

        if (!category) {
            return c.json({ items: [], total: 0, page, pageSize }, 200);
        }
        categoryId = category.id;
    }

    // Условия собираем в массив и комбинируем через and() —
    // добавляем только те фильтры, что реально пришли в запросе.
    const conditions = [];
    if (categoryId !== undefined) conditions.push(eq(products.categoryId, categoryId));
    // gte - greater than or equal
    if (query.priceMin !== undefined) conditions.push(gte(products.price, query.priceMin as number));
    // lte - less than or equal
    if (query.priceMax !== undefined) conditions.push(lte(products.price, query.priceMax as number));
    if (query.available !== undefined) conditions.push(eq(products.available, query.available as boolean));
    if (query.search) conditions.push(ilike(products.name, `%${query.search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await db.select({ total: count() }).from(products).where(where);

    // через innerJoin, чтобы получить не { products: {}, categories: {} }, а плоский объект
    const rows = await db
        .select({
            id: products.id,
            slug: products.slug,
            name: products.name,
            description: products.description,
            price: products.price,
            imageUrl: products.imageUrl,
            available: products.available,
            categorySlug: categories.slug,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

    const items = rows.map((row) => ({
        ...row,
        imageUrl: row.imageUrl ?? undefined,
    }));

    return c.json({ items, total, page, pageSize }, 200);
});

export { productsRoute };
