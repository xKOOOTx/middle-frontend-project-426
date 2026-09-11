import { pgTable, serial, text, integer, timestamp, uniqueIndex, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email)
}));

export const sessions = pgTable('sessions', {
    id: serial('id').primaryKey(),
    token: text('token').notNull(),
    userId: integer('user_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    tokenIdx: uniqueIndex('sessions_token_idx').on(table.token)
}));

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
}, (table) => ({
    slugId: uniqueIndex('categories_slug_idx').on(table.slug)
}));
export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    imageUrl: text('image_url'),
    available: boolean('available').notNull().default(true),
    categoryId: integer('category_id').notNull().references(() => categories.id),
}, (table) => ({
    slugId: uniqueIndex('products_slug_idx').on(table.slug)
}));