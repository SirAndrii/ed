import { expect, test } from '@playwright/test';

test('зберігає оцінку та відновлює її в результатах після перезавантаження', async ({ page }) => {
  await page.goto('/ed/');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/ed/#/assess/fruits');
  await expect(page.getByRole('heading', { name: 'Яблуко' })).toBeVisible();

  await page.getByRole('button', { name: /Низька складність/ }).click();
  await expect(page.getByRole('heading', { name: 'Банан' })).toBeVisible();

  await page.reload();
  await page.goto('/ed/#/results/fruits');

  const safeGroup = page.getByRole('region', { name: 'Безпечні' });
  await expect(safeGroup).toContainText('Яблуко');
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('food-assessment-v1') ?? '{}')
      .assessments?.apple?.current))
    .toBe('low');
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('food-assessment-v1') ?? '{}')
      .categoryProgress?.fruits?.assessedFoodIds))
    .toContain('apple');
});
