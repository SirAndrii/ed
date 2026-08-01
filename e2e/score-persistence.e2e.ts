import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/ed/');
  await page.evaluate(() => localStorage.clear());
});

test('варіанти нейтральні до кліку, а Назад відновлює вибрану оцінку', async ({ page }) => {
  await page.goto('/ed/#/assess/fruits');
  await expect(page.getByRole('heading', { name: 'Яблуко' })).toBeVisible();

  const low = page.getByRole('button', { name: /Низька складність/ });
  const medium = page.getByRole('button', { name: /Середня складність/ });
  await expect(low).toHaveAttribute('aria-pressed', 'false');
  await expect(medium).toHaveAttribute('aria-pressed', 'false');
  expect(await low.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toBe(await medium.evaluate((element) => getComputedStyle(element).backgroundColor));

  await low.click();
  await expect(page.getByRole('heading', { name: 'Банан' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Низька складність/ }))
    .toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: 'Назад до попереднього продукту' }).click();
  await expect(page.getByRole('heading', { name: 'Яблуко' })).toBeVisible();

  const restoredLow = page.getByRole('button', { name: /Низька складність/ });
  const restoredMedium = page.getByRole('button', { name: /Середня складність/ });
  await expect(restoredLow).toHaveAttribute('aria-pressed', 'true');
  expect(await restoredLow.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(await restoredMedium.evaluate((element) => getComputedStyle(element).backgroundColor));
});

test('відновлює прогрес категорії та оцінку в результатах після перезавантаження', async ({ page }) => {
  await page.goto('/ed/#/assess/fruits');
  await page.getByRole('button', { name: /Низька складність/ }).click();
  await expect(page.getByRole('heading', { name: 'Банан' })).toBeVisible();

  await page.getByRole('button', { name: 'Зберегти і вийти' }).click();
  await page.getByRole('link', { name: 'Категорії' }).click();
  await expect(page.getByLabel(/Оцінено 1 з/)).toBeVisible();

  await page.getByRole('button', { name: 'Продовжити категорію Фрукти та ягоди' }).click();
  await expect(page.getByRole('heading', { name: 'Банан' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Банан' })).toBeVisible();

  await page.goto('/ed/#/results/fruits');
  await expect(page.getByRole('region', { name: 'Безпечні' })).toContainText('Яблуко');
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('food-assessment-v1') ?? '{}')
      .assessments?.apple?.current))
    .toBe('low');
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('food-assessment-v1') ?? '{}')
      .categoryProgress?.fruits?.assessedFoodIds))
    .toContain('apple');
});

test('редагує оцінку в результатах і зберігає зміну після перезавантаження', async ({ page }) => {
  await page.goto('/ed/#/assess/fruits');
  await page.getByRole('button', { name: /Низька складність/ }).click();
  await expect(page.getByRole('heading', { name: 'Банан' })).toBeVisible();

  await page.goto('/ed/#/results/fruits');
  await page.getByRole('button', { name: 'Повний список' }).click();
  await page.getByRole('button', { name: 'Змінити оцінку для Яблуко' }).click();
  await page.getByRole('group', { name: 'Змінити оцінку: Яблуко' })
    .getByRole('button', { name: 'Висока' })
    .click();

  await page.getByRole('button', { name: 'За групами' }).click();
  await expect(page.getByRole('region', { name: 'Складні' })).toContainText('Яблуко');
  await expect(page.getByRole('region', { name: 'Безпечні' })).not.toContainText('Яблуко');

  await page.reload();
  await expect(page.getByRole('region', { name: 'Складні' })).toContainText('Яблуко');
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('food-assessment-v1') ?? '{}')
      .assessments?.apple?.current))
    .toBe('high');
});

test('зберігає налаштування, використовує opacity фону 0.5 та очищає всі дані', async ({ page }) => {
  await page.goto('/ed/#/settings');

  const showTags = page.getByRole('checkbox', { name: 'Показувати позначки магазинів' });
  const pastSurvey = page.getByRole('checkbox', { name: /Запитувати про складність рік тому/ });
  const reportName = page.getByRole('textbox', { name: 'Ім\'я або псевдонім у звіті' });

  await showTags.uncheck();
  await pastSurvey.check();
  await reportName.fill('Тестове ім\'я');
  await page.reload();

  await expect(showTags).not.toBeChecked();
  await expect(pastSurvey).toBeChecked();
  await expect(reportName).toHaveValue('Тестове ім\'я');

  const backgroundLayer = page.locator('div[aria-hidden="true"][style*="background-image"]').first();
  await expect(backgroundLayer).toHaveCSS('opacity', '0.5');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Видалити всі дані' }).click();
  await expect(showTags).toBeChecked();
  await expect(pastSurvey).not.toBeChecked();
  await expect(reportName).toHaveValue('');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('food-assessment-v1'))).toBeNull();
});
