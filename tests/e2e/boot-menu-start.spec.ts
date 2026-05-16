import { expect, test } from '@playwright/test'

test('boots to menu and enters the game scene on first confirm input', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle('ZeroClaw Phaser Starter')

  const canvas = page.locator('canvas')

  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await expect(canvas).toHaveAttribute('data-menu-has-save', 'false')
  await expect(canvas).toHaveAttribute(
    'data-menu-status',
    /Start a new game to enable Continue/i,
  )

  await canvas.click()
  await page.keyboard.press('Enter')

  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-stage-id', '1-1')
})
