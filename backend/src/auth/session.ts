import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { db } from '../db/index.js';
import { sessions, users } from '../db/schema.js';

const COOKIE_NAME = 'session_token';

const generateToken = () => randomBytes(32).toString('hex');

export const createSession = async (userId: number) => {
    const token = generateToken();
    await db.insert(sessions).values({ userId, token});
    return token;
};

export const findUserByToken = async (token: string) => {
    const [row] = await db
        .select({ user: users })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.token, token))
    return row?.user ?? null;
};

export const deleteSession = async (token: string) => {
    await db.delete(sessions).where(eq(sessions.token, token));
};

/**
 * NODE_ENV тут не подходит: Dockerfile всегда ставит production, а само приложение
 * может при этом обслуживаться по голому http (локальный докер-компоуз проверки, CI) —
 * Secure-кука в таком случае браузером просто не сохранится. Смотрим на реальный протокол
 * запроса: за прокси (Render и т.п.) он приходит в x-forwarded-proto, иначе берём из URL.
 */
const isHttps = (c: Context) => {
    const forwardedProto = c.req.header('x-forwarded-proto');
    if (forwardedProto) return forwardedProto.split(',')[0].trim() === 'https';
    return new URL(c.req.url).protocol === 'https:';
};

export const setSessionCookie = (c: Context, token: string) => {
    setCookie(c, COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: isHttps(c),
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // (60 секунд * 60 минут * 24 часа * количество дней) 30 дней
    })
};

export const getSessionToken = (c: Context) => getCookie(c, COOKIE_NAME);

export const clearSessionToken = (c: Context) => {
    deleteCookie(c, COOKIE_NAME, { path: '/' })
}