import { pgTable, serial, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
}, (table) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(table.slug)
}));

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    categoryId: integer('category_id').notNull().references(() => categories.id),
    brand: text('brand').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})