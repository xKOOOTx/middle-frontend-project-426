import { test, expect } from '@playwright/test';

/**
 * Опирается на идемпотентный сид промо-блоков (backend/src/db/seed.ts):
 * 3 блока, первый — на NVIDIA GeForce RTX 4070 (slug nvidia-geforce-rtx-4070).
 */

test('главная открывается на / и показывает промо-блоки', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('home-promo')).toBeVisible();
    await expect(page.getByTestId('home-promo-item')).toHaveCount(3);
});

test('клик по промо-блоку открывает страницу его товара', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('home-promo-item').first().click();

    await expect(page).toHaveURL(/\/products\/nvidia-geforce-rtx-4070/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('NVIDIA GeForce RTX 4070');
});

test('из главной открывается каталог по ссылке в шапке', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('nav-catalog').click();

    await expect(page).toHaveURL('/catalog');
    await expect(page.getByTestId('catalog-list')).toBeVisible();
});
