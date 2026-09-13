import type { components } from '../types/api'

type CreateOrderRequest = components['schemas']["CreateOrderRequest"];
type Order = components['schemas']["Order"];
type ApiError = components['schemas']["ApiError"];

export class OrderApiError extends Error {
    code: string;
    details?: ApiError['details'];

    constructor(error: ApiError) {
        super(error.message);
        this.code = error.code;
        this.details = error.details;
    }
}

export const createOrder = async (body: CreateOrderRequest): Promise<Order> => {
    const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new OrderApiError(error);
    }

    return res.json();
}

export const listOrders = async (): Promise<Order[]> => {
    const res = await fetch('/api/orders', { credentials: 'same-origin' });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new OrderApiError(error);
    }
    return res.json();
}

export const getOrder = async (id: number): Promise<Order> => {
    const res = await fetch(`/api/orders/${id}`, { credentials: 'same-origin' });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new OrderApiError(error);
    }

    return res.json();
}