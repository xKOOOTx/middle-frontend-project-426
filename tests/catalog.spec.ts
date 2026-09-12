import { test, expect } from '@playwright/test';

/**
 * Тесты опираются на конкретные данные из идемпотентного сида (backend/src/db/seed.ts):
 * 3 категории (videocards/processors/motherboards) по 18 товаров, pageSize = 12, итого 54.
 * Так как сид идемпотентен и не меняется между прогонами, можно ссылаться на конкретные
 * названия/цены — в отличие от auth-тестов, тут не нужна генерация уникальных данных на тест.
 */

test('каталог загружается, карточки товаров видны', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('catalog-list')).toBeVisible();
    await expect(page.getByTestId('catalog-item')).toHaveCount(12); // первая страница при pageSize=12
});

test('в карточке есть название, цена и доступность', async ({ page }) => {
    await page.goto('/');

    const card = page.getByTestId('catalog-item').first();

    await expect(card.getByTestId('catalog-item-name')).toBeVisible();
    await expect(card.getByTestId('catalog-item-price')).toBeVisible();
    await expect(card.getByTestId('catalog-item-availability')).toBeVisible();
});

test('фильтр по категории сужает список', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('filter-category').click();
    await page.locator('.ant-select-item-option', { hasText: 'Материнские платы' }).click();

    await expect(page).toHaveURL(/category=motherboards/);
    await expect(page.getByText('MSI PRO B760M-A', { exact: true })).toBeVisible();
    await expect(page.getByText('NVIDIA GeForce RTX 4060', { exact: true })).not.toBeVisible();
});

test('поиск по части названия оставляет в выдаче подходящий товар', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('filter-search').fill('Ryzen 9 7950X3D');

    // debounce (300мс) + сетевой запрос покрываются автоожиданием toBeVisible,
    // отдельно руками ничего не ждём — проверяем конечное состояние, а не сам факт изменения
    await expect(page.getByText('AMD Ryzen 9 7950X3D', { exact: true })).toBeVisible();
    await expect(page.getByTestId('catalog-item')).toHaveCount(1);
});

test('фильтр по цене меняет состав выдачи', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('filter-price-min').fill('150000');
    await page.getByTestId('filter-price-min').press('Tab');

    await expect(page.getByText('NVIDIA GeForce RTX 4090', { exact: true })).toBeVisible();
    await expect(page.getByText('Gigabyte B760M DS3H')).not.toBeVisible();
});

test('сброс фильтров возвращает полный список', async ({ page }) => {
    await page.goto('/?category=motherboards');

    await expect(page.getByTestId('catalog-pagination')).toContainText('из 2'); // 18 / 12 = 2 страницы

    await page.getByTestId('filter-reset').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('catalog-pagination')).toContainText('из 5'); // 54 / 12 = 5 страниц
});

test('комбинация фильтров без совпадений показывает пустое состояние', async ({ page }) => {
    // у материнских плат максимальная цена в сиде 42990 — фильтр отсекает всё
    await page.goto('/?category=motherboards&priceMin=180000');

    await expect(page.getByTestId('catalog-empty')).toBeVisible();
    await expect(page.getByTestId('catalog-item')).toHaveCount(0);
});

test('переход на следующую страницу меняет набор карточек', async ({ page }) => {
    await page.goto('/');

    const firstItemOnPageOne = await page.getByTestId('catalog-item-name').first().textContent();

    await page.getByTestId('catalog-page-next').click();

    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByTestId('catalog-item-name').first()).not.toHaveText(firstItemOnPageOne ?? '');
});

test('смена фильтра возвращает на первую страницу выдачи', async ({ page }) => {
    await page.goto('/?page=2');
    await expect(page).toHaveURL(/page=2/);

    await page.getByTestId('filter-category').click();
    await page.locator('.ant-select-item-option', { hasText: 'Процессоры' }).click();

    await expect(page).toHaveURL(/page=1/);
});

test('на первой странице кнопка "назад" неактивна', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('catalog-page-prev')).toBeDisabled();
});

test('перезагрузка страницы сохраняет выдачу и значения контролов', async ({ page }) => {
    await page.goto('/?category=processors&available=true');
    await expect(page.getByText('AMD Ryzen 5 7500F', { exact: true })).toBeVisible();

    await page.reload();

    await expect(page.getByText('AMD Ryzen 5 7500F', { exact: true })).toBeVisible();
    await expect(page.getByTestId('filter-category')).toContainText('Процессоры');
    await expect(page.getByTestId('filter-available')).toBeChecked();
});

test('кнопка "назад" браузера возвращает предыдущую выдачу', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('NVIDIA GeForce RTX 4060', { exact: true })).toBeVisible();

    await page.getByTestId('filter-category').click();
    await page.locator('.ant-select-item-option', { hasText: 'Материнские платы' }).click();
    await expect(page.getByText('MSI PRO B760M-A', { exact: true })).toBeVisible();

    await page.goBack();

    await expect(page.getByText('NVIDIA GeForce RTX 4060', { exact: true })).toBeVisible();
});
