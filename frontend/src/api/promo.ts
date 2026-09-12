import type { components } from '../types/api'

export const listPromo = async (): Promise<components['schemas']['PromoBlock'][]> => {
    const res = await fetch('/api/promo', {
        credentials: 'same-origin',
    })

    if (!res.ok) {
        const error: components['schemas']['ApiError'] = await res.json();
        throw new Error(error.message);
    }

    return res.json()
}