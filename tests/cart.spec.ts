import { test, expect } from '@playwright/test';

/**
 * Опирается на идемпотентный сид (backend/src/db/seed.ts):
 * nvidia-geforce-rtx-4070 - доступный товар, 62990 ₽;
 * intel-arc-b580 - недоступный товар (available: false).
 * Корзина живёт в localStorage, поэтому отдельная генерация уникальных данных на тест не нужна
 * Playwright и так даёт каждому тесту свежий контекст браузера.
 */

test('карточка товара показывает название, цену и описание', async ({ page }) => {
    await page.goto('/products/nvidia-geforce-rtx-4070');

    await expect(page.getByTestId('product-name')).toHaveText('NVIDIA GeForce RTX 4070');
    await expect(page.getByTestId('product-price')).toHaveText(`${(62990).toLocaleString('ru-RU')} ₽`);
    await expect(page.getByTestId('product-description')).toBeVisible();
});

test('товар добавляется в корзину и появляется в ней', async ({ page }) => {
    await page.goto('/products/nvidia-geforce-rtx-4070');
    await page.getByTestId('product-add-to-cart').click();

    await page.getByTestId('nav-cart').click();

    await expect(page).toHaveURL('/cart');
    await expect(page.getByTestId('cart-item')).toHaveCount(1);
    await expect(page.getByTestId('cart-item')).toContainText('NVIDIA GeForce RTX 4070');
});

test('изменение количества пересчитывает итоговую сумму', async ({ page }) => {
    await page.goto('/products/nvidia-geforce-rtx-4070');
    await page.getByTestId('product-add-to-cart').click();
    await page.goto('/cart');

    await expect(page.getByTestId('cart-total')).toHaveText(`${(62990).toLocaleString('ru-RU')} ₽`);

    await page.getByTestId('cart-item-qty').fill('2');
    await page.getByTestId('cart-item-qty').press('Tab');

    await expect(page.getByTestId('cart-total')).toHaveText(`${(125980).toLocaleString('ru-RU')} ₽`);
});

test('позиция удаляется из корзины', async ({ page }) => {
    await page.goto('/products/nvidia-geforce-rtx-4070');
    await page.getByTestId('product-add-to-cart').click();
    await page.goto('/cart');

    await expect(page.getByTestId('cart-item')).toHaveCount(1);

    await page.getByTestId('cart-item-remove').click();

    await expect(page.getByTestId('cart-item')).toHaveCount(0);
    await expect(page.getByTestId('cart-empty')).toBeVisible();
});

test('состав корзины сохраняется после перезагрузки страницы', async ({ page }) => {
    await page.goto('/products/nvidia-geforce-rtx-4070');
    await page.getByTestId('product-add-to-cart').click();
    await page.goto('/cart');
    await expect(page.getByTestId('cart-item')).toHaveCount(1);

    await page.reload();

    await expect(page.getByTestId('cart-item')).toHaveCount(1);
    await expect(page.getByTestId('cart-item')).toContainText('NVIDIA GeForce RTX 4070');
});

test('недоступный товар нельзя добавить в корзину', async ({ page }) => {
    await page.goto('/products/intel-arc-b580');

    await expect(page.getByTestId('product-add-to-cart')).toBeDisabled();

    await page.goto('/cart');
    await expect(page.getByTestId('cart-empty')).toBeVisible();
});

test('пустая корзина показывает состояние и блокирует оформление', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.getByTestId('cart-empty')).toBeVisible();
    await expect(page.getByTestId('cart-checkout')).toBeDisabled();
});
