import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { Value } from '@sinclair/typebox/value';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import {
    createSession,
    findUserByToken,
    deleteSession,
    setSessionCookie,
    getSessionToken,
    clearSessionToken,
} from '../auth/session.js';
import { components } from '../schema.js';

const auth = new Hono();

const apiError = (code: string, message: string) => ({ code, message });

const toUserDto = (user: { id: number; email: string; createdAt: Date}) => ({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
})

auth.post('/register', async (c) => {
    const body = await c.req.json();

    if (!Value.Check(components.schemas.RegisterRequest, body)) {
        return c.json(apiError('VALIDATION_ERROR', 'Некорректные данные регистрации'), 400);
    }

    const { email, password } = body;

    const [existing] = await db.select().from(users).where(eq(users.email, email));

    if(existing) {
        return c.json(apiError('EMAIL_TAKEN', 'Этот email уже зарегистрирован'), 409);
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(users).values({ email, passwordHash }).returning();

    const token = await createSession(user.id);
    setSessionCookie(c, token);

    return c.json(toUserDto(user), 201);
});

auth.post('/login', async (c) => {
    const body = await c.req.json();

    const invalidCredentials = () => c.json(apiError('INVALID_CREDENTIALS', 'Неверный email или пароль'), 401)

    if (!Value.Check(components.schemas.LoginRequest, body)) {
        return invalidCredentials();
    };

    const { email, password } = body;
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        return invalidCredentials();
    };

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
        return invalidCredentials();
    };

    const token = await createSession(user.id);;
    setSessionCookie(c, token);

    return c.json(toUserDto(user), 200);
});

auth.post('/logout', async (c) => {
    const token = await getSessionToken(c);
    if (token) {
        await deleteSession(token);
    };
    clearSessionToken(c);
    return c.body(null, 204);
});

auth.get('/me', async (c) => {
    const token = await getSessionToken(c);
    const user = token ? await findUserByToken(token) : null;

    if (!user) {
        return c.json(apiError('UNAUTHORIZED', 'Вы не авторизованы'), 401);
    };

    return c.json(toUserDto(user), 200);
});

export { auth };