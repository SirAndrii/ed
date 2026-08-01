import { expect, test } from '@playwright/test';

test('відкриває, запускає та закриває демо Nyan Cat з хедера', async ({ page }) => {
  await page.goto('/ed/');

  await page.getByRole('button', { name: 'Запустити гру Nyan Cat: Lost In Space' }).click();
  const dialog = page.getByRole('dialog', { name: 'Nyan Cat: Lost In Space — демо' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel(/Ігрове поле/)).toBeVisible();

  await dialog.getByRole('button', { name: 'Почати гру' }).click();
  await expect(dialog.getByText(/Рахунок:/)).toBeVisible();
  await expect.poll(() => dialog.locator('audio').evaluate((audio: HTMLAudioElement) => audio.readyState))
    .toBeGreaterThanOrEqual(2);
  await dialog.getByLabel(/Ігрове поле/).click();
  await dialog.getByRole('button', { name: 'Вниз' }).click();
  await expect(dialog.getByRole('button', { name: /Вимкнути музику|Увімкнути музику/ })).toBeVisible();
  await expect.poll(async () => {
    const text = await dialog.getByText(/Рахунок:/).textContent();
    return Number(text?.match(/\d+/)?.[0] ?? 0);
  }).toBeGreaterThan(0);

  await dialog.getByRole('button', { name: 'Закрити гру' }).click();
  await expect(dialog).toBeHidden();
});
