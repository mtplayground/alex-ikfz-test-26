import { expect, test } from '@playwright/test'

test('renders the Phaser canvas for the boot scene', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('ZeroClaw Phaser Starter')
  await expect(page.locator('canvas')).toBeVisible()
})
