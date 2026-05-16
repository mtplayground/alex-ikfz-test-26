import { expect, test } from '@playwright/test'

test('boots into the menu scene', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('ZeroClaw Phaser Starter')
  const canvas = page.locator('canvas')

  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await expect(canvas).toHaveAttribute('data-menu-has-save', 'false')
})

test('supports keyboard navigation and confirmation in the menu', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')

  await page.keyboard.press('ArrowDown')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'continue')

  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-menu-status', /No saved run/)

  await page.keyboard.press('ArrowUp')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')

  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-menu-has-save', 'true')
  await expect(canvas).toHaveAttribute('data-menu-status', /Started a new game/)
})
