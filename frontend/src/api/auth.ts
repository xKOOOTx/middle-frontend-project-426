import type { components } from '../types/api'

type RegisterRequest = components['schemas']['RegisterRequest'];
type LoginRequest = components['schemas']['LoginRequest'];
type User = components['schemas']['User'];

export const register = async (body: RegisterRequest): Promise<User> => {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const error: components['schemas']['ApiError'] = await res.json();
        throw new Error(error.message)
    }

    return res.json();
}
export const login = async (body: LoginRequest): Promise<User>  => {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const error: components['schemas']['ApiError'] = await res.json();
        throw new Error(error.message);
    }

    return res.json();
}
export const logout = async () => {
    const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-type': 'application/json' },
    })

    if (!res.ok) {
        const error: components['schemas']['ApiError'] = await res.json();
        throw new Error(error.message);
    }
}
export const me = async () => {
    const res = await fetch('/api/auth/me', {
        credentials: 'same-origin',
        headers: { 'Content-type': 'application/json' },
    })

    if (!res.ok) return null;

    return res.json();
}