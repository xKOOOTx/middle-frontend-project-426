import type { components } from '../types/api'

type ProductList = components['schemas']['ProductList'];

export type ProductFilters = {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    available?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
};

export const listProducts = async (filters: ProductFilters): Promise<ProductList> => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
    if (filters.available !== undefined) params.set('available', String(filters.available));
    if (filters.search) params.set('search', String(filters.search));
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize));

    const res = await fetch(`/api/products?${params.toString()}`, { credentials: 'same-origin' })

    if(!res.ok) {
        const error: components['schemas']['ApiError'] = await res.json();
        throw new Error(error.message);
    }

    return res.json();
}