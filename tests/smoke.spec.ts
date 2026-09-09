import { test, expect } from '@playwright/test';

test('Главная открывается', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
})
