import { db } from './index.js';
import { categories, products, promoBlocks } from './schema.js';
import { sql, inArray } from 'drizzle-orm';

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

type ProductSeed = {
    name: string;
    price: number;
    available?: boolean;
    hasImage?: boolean;
};

type CategorySeed = {
    slug: string;
    name: string;
    description: (name: string) => string;
    models: ProductSeed[];
};

type PromoSeed = {
    title: string;
    text: string;
    productSlug: string;
}

const categoriesData: CategorySeed[] = [
    {
        slug: 'videocards',
        name: 'Видеокарты',
        description: (name) => `${name} — баланс производительности и цены для игр и рендеринга.`,
        models: [
            { name: 'NVIDIA GeForce RTX 4060', price: 32990, hasImage: false },
            { name: 'NVIDIA GeForce RTX 4060 Ti', price: 42990 },
            { name: 'NVIDIA GeForce RTX 4070', price: 62990 },
            { name: 'NVIDIA GeForce RTX 4070 Ti', price: 84990 },
            { name: 'NVIDIA GeForce RTX 4070 Ti Super', price: 94990 },
            { name: 'NVIDIA GeForce RTX 4080', price: 119990 },
            { name: 'NVIDIA GeForce RTX 4080 Super', price: 129990 },
            { name: 'NVIDIA GeForce RTX 4090', price: 189990 },
            { name: 'AMD Radeon RX 7600', price: 27990 },
            { name: 'AMD Radeon RX 7600 XT', price: 34990 },
            { name: 'AMD Radeon RX 7700 XT', price: 49990 },
            { name: 'AMD Radeon RX 7800 XT', price: 59990 },
            { name: 'AMD Radeon RX 7900 GRE', price: 74990 },
            { name: 'AMD Radeon RX 7900 XT', price: 89990 },
            { name: 'AMD Radeon RX 7900 XTX', price: 109990 },
            { name: 'Intel Arc A750', price: 24990 },
            { name: 'Intel Arc A770', price: 29990 },
            { name: 'Intel Arc B580', price: 32990, available: false },
        ],
    },
    {
        slug: 'processors',
        name: 'Процессоры',
        description: (name) =>
            `${name} — процессор для сборки, где важны и однопоточная производительность, и запас на будущее.`,
        models: [
            { name: 'AMD Ryzen 5 7500F', price: 14990 },
            { name: 'AMD Ryzen 5 7600', price: 19990 },
            { name: 'AMD Ryzen 5 7600X', price: 22990 },
            { name: 'AMD Ryzen 7 7700', price: 29990 },
            { name: 'AMD Ryzen 7 7700X', price: 32990 },
            { name: 'AMD Ryzen 7 7800X3D', price: 38990 },
            { name: 'AMD Ryzen 9 7900X', price: 44990 },
            { name: 'AMD Ryzen 9 7900X3D', price: 49990 },
            { name: 'AMD Ryzen 9 7950X', price: 54990 },
            { name: 'AMD Ryzen 9 7950X3D', price: 62990 },
            { name: 'Intel Core i5-13400F', price: 15990 },
            { name: 'Intel Core i5-14400F', price: 17990 },
            { name: 'Intel Core i5-14600K', price: 26990 },
            { name: 'Intel Core i7-13700K', price: 34990 },
            { name: 'Intel Core i7-14700K', price: 37990 },
            { name: 'Intel Core i9-13900K', price: 46990 },
            { name: 'Intel Core i9-14900K', price: 52990 },
            { name: 'Intel Core i9-14900KS', price: 68990, available: false },
        ],
    },
    {
        slug: 'motherboards',
        name: 'Материнские платы',
        description: (name) => `${name} — плата с балансом возможностей расширения и стабильного питания.`,
        models: [
            { name: 'MSI PRO B760M-A', price: 8990 },
            { name: 'MSI PRO B650M-A', price: 10990 },
            { name: 'Gigabyte B760M DS3H', price: 7990 },
            { name: 'Gigabyte B650M DS3H', price: 11990 },
            { name: 'ASUS Prime B760M-A', price: 9990 },
            { name: 'ASUS Prime B650M-A', price: 12990 },
            { name: 'MSI MAG B760 Tomahawk', price: 18990 },
            { name: 'MSI MAG B650 Tomahawk', price: 21990 },
            { name: 'Gigabyte Z790 Aorus Elite', price: 24990 },
            { name: 'Gigabyte X670 Aorus Elite', price: 27990 },
            { name: 'ASUS ROG Strix Z790-E', price: 39990 },
            { name: 'ASUS ROG Strix X670E-E', price: 42990 },
            { name: 'ASRock Z790 Pro RS', price: 19990 },
            { name: 'ASRock B650 Pro RS', price: 13990 },
            { name: 'MSI MPG Z790 Edge', price: 29990 },
            { name: 'MSI MPG X670E Edge', price: 32990 },
            { name: 'ASUS TUF Gaming B760-Plus', price: 14990 },
            { name: 'ASUS TUF Gaming X670E-Plus', price: 22990, available: false },
        ],
    },
];

const promoData: PromoSeed[] = [
    {
        title: 'Игровая сборка на RTX 4070',
        text: '12 ГБ памяти и уверенный запас на 1440p без переплаты за топ линейки',
        productSlug: 'nvidia-geforce-rtx-4070'
    },
    {
        title: 'Процессор для игр',
        text: '3D V-Cache даёт прирост там, где частота уже не помогает',
        productSlug: 'amd-ryzen-7-7800x3d'
    },
    {
        title: 'Плата с запасом на будущее',
        text: 'Надёжное питание и апрейг без замены платформы',
        productSlug: 'msi-mag-b760-tomahawk'
    },
]

export const seed = async () => {
    /** Явное приведение к int заставляет Postgres вернуть обычное 4-байтовое целое, а pg тогда честно отдаёт его как настоящий JS number */
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
    const [{ promoBlocksCount }] = await db.select({ promoBlocksCount: sql<number>`count(*)::int` }).from(promoBlocks);

    if (!count) {
        const insertedCategories = await db
            .insert(categories)
            .values(categoriesData.map(({ slug, name }) => ({ slug, name })))
            .returning();

        /** т.к. данные (категории) захардкожены можно обойтись non-null assertion */
        const findCategoryId = (slug: string) => insertedCategories.find((c) => c.slug === slug)!.id;

        const productsData = categoriesData.flatMap(({ slug, description, models }) =>
            models.map(({ name, price, available = true, hasImage = true }) => ({
                slug: slugify(name),
                name,
                description: description(name),
                price,
                available,
                imageUrl: hasImage ? `https://picsum.photos/seed/${slugify(name)}/400/300` : undefined,
                categoryId: findCategoryId(slug),
            })),
        );

        await db.insert(products).values(productsData);

        console.log(`Seeded ${categoriesData.length} categories and ${productsData.length} products`);
    } else {
        console.log('Seed skipped: categories already exist')
    }

    // выполняем после блока с категориями/товарами чтобы на холодной базе не было ошибок (дожидаемся наполнения и потом находим)
    if (!promoBlocksCount) {
        const promoProducts = await db
            .select({ id: products.id, slug: products.slug })
            .from(products)
            .where(inArray(products.slug, promoData.map(p => p.productSlug)))

        const findProductId = (slug: string) => promoProducts.find(p => p.slug === slug)!.id;

        const promoBlocksData = promoData.map(({ title, text, productSlug }) => ({
            title,
            text,
            productId: findProductId(productSlug),
        }))

        await db.insert(promoBlocks).values(promoBlocksData);

        console.log(`Seeded ${promoBlocksData.length} promo blocks`);
    } else {
        console.log('Seed skipped: promo block already exist');
    }


};
