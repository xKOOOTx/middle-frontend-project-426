import type { components } from '../types/api';

export const listCategories = async (): Promise<components['schemas']['Category'][]> => {
    const res = await fetch(`/api/categories`, {
        credentials: 'same-origin',
    })

    if (!res.ok) {
        const error: components['schemas']['ApiError'] = await res.json();
        throw new Error(error.message);
    };

    return res.json();
}