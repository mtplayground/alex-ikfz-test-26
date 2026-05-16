import { expect, test } from '@playwright/test'

test('boots into the menu scene', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('ZeroClaw Phaser Starter')
  const canvas = page.locator('canvas')

  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await expect(canvas).toHaveAttribute('data-menu-has-save', 'false')
})

test('guards Continue when no save exists, then starts and exercises the jump preview', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await canvas.click()

  await page.keyboard.press('ArrowDown')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'continue')

  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-menu-status', /No saved run/)

  await page.keyboard.press('ArrowUp')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')

  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'player-preview-scene')
  await expect(canvas).toHaveAttribute('data-player-grounded', 'true')

  await page.keyboard.down('Space')
  await expect(canvas).toHaveAttribute('data-player-grounded', 'false')
  await expect(canvas).toHaveAttribute('data-player-jump-state', 'rising')
  await page.keyboard.up('Space')

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return Number(canvasElement?.dataset.playerVelocityY ?? '0') > -200
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return canvasElement?.dataset.playerJumpState === 'falling'
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return canvasElement?.dataset.playerGrounded === 'true'
  })
})
