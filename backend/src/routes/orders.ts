import { Hono } from 'hono';
import { and, eq, inArray } from 'drizzle-orm';
import { Value } from '@sinclair/typebox/value';
import { db } from '../db/index.js';
import { orders, orderItems, products } from '../db/schema.js';
import { getSessionToken, findUserByToken } from '../auth/session.js';
import { schema } from '../schema.js';

type CreateOrderRequestBody = {
    items: {
        productId: number;
        qty: number;
    }[];
    method: 'delivery' | 'pickup';
    recipientName: string;
    phone: string;
    address?: string;
}

const ordersRoute = new Hono();

const apiError = (code: string, message: string, details?: Record<string, unknown>) => ({
    code,
    message,
    ...(details ? { details } : {}),
});

ordersRoute.post('/', async (c) => {
    const token = await getSessionToken(c);
    const user = token ? await findUserByToken(token) : null;

    if (!user) {
        return c.json(apiError('UNAUTHORIZED', 'Вы не авторизованы'), 401);
    }

    const body = await c.req.json();

    if (!Value.Check(schema['/api/orders'].POST.args, { body })) {
        return c.json(apiError('VALIDATION_ERROR', 'Некорректные данные заказа'), 400);
    }

    const { items, method, recipientName, phone, address } = body as CreateOrderRequestBody;

    if (items.length === 0) {
        return c.json(apiError('EMPTY_CART', 'Корзина пуста'), 400);
    }

    if (method === 'delivery' && !address) {
        return c.json(apiError('ADDRESS_REQUIRED', 'Укажите адрес доставки'), 400);
    }

    const productIds = items.map((item: { productId: number }) => item.productId);
    const foundProducts = await db.select().from(products).where(inArray(products.id, productIds));

    const checks = items.map((item: { productId: number; qty: number }) => {
        const product = foundProducts.find((p) => p.id === item.productId);

        if (!product) {
            return { productId: item.productId, valid: false, reason: 'not_found' as const };
        }
        if (!product.available) {
            return { productId: item.productId, valid: false, reason: 'unavailable' as const };
        }
        return { productId: item.productId, valid: true };
    });

    if (checks.some((check) => !check.valid)) {
        return c.json(
            apiError('ORDER_REJECTED', 'Некоторые товары недоступны', { items: checks }),
            400,
        );
    }

    const orderItemsData = items.map((item: { productId: number; qty: number }) => {
        const product = foundProducts.find((p) => p.id === item.productId)!;
        return {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: item.qty,
        };
    });

    const total = orderItemsData.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await db.transaction(async (tx) => {
        const [insertedOrder] = await tx
            .insert(orders)
            .values({
                userId: user.id,
                method,
                recipientName,
                phone,
                address: method === 'delivery' ? address : undefined,
                total,
            })
            .returning();

        const insertedItems = await tx
            .insert(orderItems)
            .values(orderItemsData.map((item) => ({ ...item, orderId: insertedOrder.id })))
            .returning();

        return { ...insertedOrder, items: insertedItems };
    });

    return c.json(order, 201);
});

ordersRoute.get('/', async (c) => {
    const token = await getSessionToken(c);
    const user = token ? await findUserByToken(token) : null;

    if (!user) {
        return c.json(apiError('UNAUTHORIZED', 'Вы не авторизованы'), 401);
    }

    const ownOrders = await db.select().from(orders).where(eq(orders.userId, user.id));

    if (ownOrders.length === 0) {
        return c.json([], 200);
    }

    const orderIds = ownOrders.map((order) => order.id);
    const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));

    const result = ownOrders.map((order) => ({
        ...order,
        items: items.filter((item) => item.orderId === order.id),
    }));

    return c.json(result, 200);
});

ordersRoute.get('/:id', async (c) => {
    const token = await getSessionToken(c);
    const user = token ? await findUserByToken(token) : null;

    if (!user) {
        return c.json(apiError('UNAUTHORIZED', 'Вы не авторизованы'), 401);
    }

    const id = Number(c.req.param('id'));

    const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, id), eq(orders.userId, user.id)));

    if (!order) {
        return c.json(apiError('NOT_FOUND', 'Заказ не найден'), 404);
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

    return c.json({ ...order, items }, 200);
});

export { ordersRoute };