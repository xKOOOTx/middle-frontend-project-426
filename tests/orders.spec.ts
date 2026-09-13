import { test, expect } from '@playwright/test';

const uniqueEmail = () => `orders-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
const PASSWORD = 'password123';

const registerViaUi = async (page: import('@playwright/test').Page, email: string, password: string) => {
    await page.goto('/signup');
    await page.getByTestId('auth-email').fill(email);
    await page.getByTestId('auth-password').fill(password);
    await page.getByTestId('auth-submit').click();
    // дожидаемся редиректа на '/', который происходит только после того,
    // как завершится запрос регистрации и куки сессии применятся —
    // иначе следующий page.goto() может проскочить раньше, чем кука долетит
    await expect(page).toHaveURL('/');
};

const addToCart = async (page: import('@playwright/test').Page, slug: string) => {
    await page.goto(`/products/${slug}`);
    await page.getByTestId('product-add-to-cart').click();
};

const fillRecipient = async (page: import('@playwright/test').Page) => {
    await page.getByTestId('checkout-name').fill('Иван Петров');
    await page.getByTestId('checkout-phone').fill('+79990001122');
};

test('неавторизованный пользователь не может оформить заказ', async ({ page }) => {
    await addToCart(page, 'nvidia-geforce-rtx-4070');

    await page.goto('/checkout');

    await expect(page).toHaveURL('/signin');
});

test('авторизованный пользователь оформляет заказ и видит страницу успеха', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);
    await addToCart(page, 'nvidia-geforce-rtx-4070');

    await page.getByTestId('nav-cart').click();
    await page.getByTestId('cart-checkout').click();
    await expect(page).toHaveURL('/checkout');

    await fillRecipient(page);
    await page.getByTestId('checkout-submit').click();

    await expect(page.getByTestId('order-success')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText(`${(62990).toLocaleString('ru-RU')} ₽`);
});

test('пустую корзину оформить нельзя', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);

    await page.goto('/cart');
    await expect(page.getByTestId('cart-empty')).toBeVisible();
    await expect(page.getByTestId('cart-checkout')).toBeDisabled();

    await page.goto('/checkout');
    await expect(page).toHaveURL('/cart');
});

test('итоговая сумма заказа считается сервером по количеству позиций, а не присылается с фронта', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);
    await addToCart(page, 'nvidia-geforce-rtx-4070');

    await page.goto('/cart');
    await page.getByTestId('cart-item-qty').fill('3');
    await page.getByTestId('cart-item-qty').press('Tab');

    await page.getByTestId('cart-checkout').click();
    await fillRecipient(page);
    await page.getByTestId('checkout-submit').click();

    await expect(page.getByTestId('order-success')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText(`${(62990 * 3).toLocaleString('ru-RU')} ₽`);
});

test('при доставке адрес обязателен, при самовывозе не запрашивается', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);
    await addToCart(page, 'nvidia-geforce-rtx-4070');
    await page.goto('/checkout');

    // по умолчанию — самовывоз, поля адреса нет вовсе
    await expect(page.getByTestId('checkout-address')).not.toBeVisible();

    await page.getByTestId('checkout-method').selectOption('delivery');
    await expect(page.getByTestId('checkout-address')).toBeVisible();

    await fillRecipient(page);
    await page.getByTestId('checkout-submit').click();

    // без обязательного адреса форма не отправляется
    await expect(page).toHaveURL('/checkout');
    await expect(page.getByTestId('order-success')).not.toBeVisible();

    await page.getByTestId('checkout-address').fill('ул. Ленина, 15, кв. 42');
    await page.getByTestId('checkout-submit').click();

    await expect(page.getByTestId('order-success')).toBeVisible();
});

test('заказ с недоступным товаром отклоняется целиком, ошибка показывается пользователю', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);

    // через обычный UI недоступный товар в корзину не добавить (кнопка задизейблена) —
    // имитируем ситуацию, когда товар стал недоступен уже после того, как лежал в корзине
    const product = await page.evaluate(async () => {
        const res = await fetch('/api/products/intel-arc-b580');
        return res.json();
    });
    await page.evaluate((productId) => {
        localStorage.setItem('cart', JSON.stringify([{ productId, qty: 1 }]));
    }, product.id);

    await page.goto('/checkout');
    await fillRecipient(page);
    await page.getByTestId('checkout-submit').click();

    await expect(page.getByTestId('order-error')).toBeVisible();
    await expect(page.getByTestId('order-error')).toContainText('Intel Arc B580');
    await expect(page.getByTestId('order-success')).not.toBeVisible();
});

test('в личном кабинете видны только свои заказы', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);
    await addToCart(page, 'nvidia-geforce-rtx-4070');
    await page.goto('/checkout');
    await fillRecipient(page);
    await page.getByTestId('checkout-submit').click();
    await expect(page.getByTestId('order-success')).toBeVisible();

    await page.getByTestId('nav-signout').click();
    await registerViaUi(page, uniqueEmail(), PASSWORD);

    await page.goto('/account');
    await expect(page.getByTestId('account-orders-empty')).toBeVisible();
    await expect(page.getByTestId('account-order-item')).toHaveCount(0);
});

test('открытый заказ в кабинете показывает состав, количество, цены и итог', async ({ page }) => {
    await registerViaUi(page, uniqueEmail(), PASSWORD);
    await addToCart(page, 'nvidia-geforce-rtx-4070');
    await page.goto('/checkout');
    await fillRecipient(page);
    await page.getByTestId('checkout-submit').click();
    await expect(page.getByTestId('order-success')).toBeVisible();

    await page.goto('/account');

    const order = page.getByTestId('account-order-item').first();
    await expect(order).toBeVisible();
    await expect(order).toContainText('NVIDIA GeForce RTX 4070');
    await expect(order.getByTestId('order-status')).toHaveAttribute('data-status', 'paid');
    await expect(order.getByTestId('order-total')).toHaveText(`${(62990).toLocaleString('ru-RU')} ₽`);
});
