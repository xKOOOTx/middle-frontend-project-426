import { db } from './index.js';
import { categories, products } from './schema.js';
import { sql } from 'drizzle-orm';

const categoriesData = [
    { slug: 'videocards', name: 'Видеокарты' },
    { slug: 'processors', name: 'Процессоры' },
    { slug: 'motherboards', name: 'Материнские платы' },
];

export const seed = async () => {
    /** Явное приведение к int заставляет Postgres вернуть обычное 4-байтовое целое, а pg тогда честно отдаёт его как настоящий JS number */
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
    if (count > 0) {
        console.log('Seed skipped: categories already exist');
        return;
    }

    const insertedCategories = await db.insert(categories).values(categoriesData).returning();

    /** т.к. данные(категории) захардкожены можно обойтись non-null assertion*/
    const findCategoryId = (slug: string) =>
        insertedCategories.find(c => c.slug === slug)!.id

    await db.insert(products).values([
        {
            name: 'Игровая сборка на RTX 4070',
            description: '12 ГБ GDDR6X и DLSS 3 — комфортный 1440p без переплаты за флагман.',
            price: 6299000,
            categoryId: findCategoryId('videocards'),
            brand: 'NVIDIA GEFORCE RTX 4070',
        },
        {
            name: 'Процессор для игр',
            description: '3D V-Cache даёт прирост в играх там, где частота уже не помогает.',
            price: 3899000,
            categoryId: findCategoryId('processors'),
            brand: 'AMD RYZEN 7 7800X3D',
        },
        {
            name: 'Плата с запасом на будущее',
            description: 'DDR5, два слота M.2 и питание с запасом под разгон процессора.',
            price: 1899000,
            categoryId: findCategoryId('motherboards'),
            brand: 'MSI MAG B760 TOMAHAWK',
        },
    ]);

    console.log(`Seeded ${categoriesData.length} categories and 3 products`)
}