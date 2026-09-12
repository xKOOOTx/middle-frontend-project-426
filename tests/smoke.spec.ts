import { test, expect } from '@playwright/test';

test('Главная открывается', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('catalog-list')).toBeVisible();
})
