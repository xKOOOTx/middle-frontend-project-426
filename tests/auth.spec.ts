import { test, expect } from '@playwright/test';

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
const PASSWORD = 'password123';

const registerViaUi = async (page: import('@playwright/test').Page, email: string, password: string) => {
  await page.goto('/signup');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();
};

const loginViaUi = async (page: import('@playwright/test').Page, email: string, password: string) => {
  await page.goto('/signin');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();
};

test('Регистрация авторизует пользователя', async ({ page }) => {
  await registerViaUi(page, uniqueEmail(), PASSWORD);

  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('nav-account')).toBeVisible();
});

test('Логин по email и паролю авторизует пользователя', async ({ page }) => {
  const email = uniqueEmail();

  await registerViaUi(page, email, PASSWORD);
  await page.getByTestId('nav-signout').click();

  await loginViaUi(page, email, PASSWORD);

  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('nav-account')).toBeVisible();
});

test('Логаут закрывает доступ к личному разделу', async ({ page }) => {
  const email = uniqueEmail();

  await registerViaUi(page, email, PASSWORD);
  await page.getByTestId('nav-signout').click();

  await expect(page.getByTestId('nav-signin')).toBeVisible();

  await page.goto('/account');
  await expect(page).toHaveURL('/signin');
});

test('Занятый email отклоняется понятной ошибкой', async ({ page }) => {
  const email = uniqueEmail();

  await registerViaUi(page, email, PASSWORD);
  await page.getByTestId('nav-signout').click();

  await registerViaUi(page, email, PASSWORD);

  await expect(page).toHaveURL('/signup');
  await expect(page.getByTestId('auth-error')).toBeVisible();
  await expect(page.getByTestId('auth-error')).not.toBeEmpty();
});

test('Неверный пароль отклоняется понятной ошибкой', async ({ page }) => {
  const email = uniqueEmail();

  await registerViaUi(page, email, PASSWORD);
  await page.getByTestId('nav-signout').click();

  await loginViaUi(page, email, 'wrong-password');

  await expect(page).toHaveURL('/signin');
  await expect(page.getByTestId('auth-error')).toBeVisible();
  await expect(page.getByTestId('auth-error')).not.toBeEmpty();
});

test('После reload пользователь остаётся авторизован', async ({ page }) => {
  await registerViaUi(page, uniqueEmail(), PASSWORD);
  await expect(page.getByTestId('nav-account')).toBeVisible();

  await page.reload();

  await expect(page.getByTestId('nav-account')).toBeVisible();
});

test('Неавторизованный не попадает на защищённую страницу по прямому адресу', async ({ page }) => {
  await page.goto('/account');

  await expect(page).toHaveURL('/signin');
});
