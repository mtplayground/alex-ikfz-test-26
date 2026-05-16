import { expect, test } from '@playwright/test'

test('boots into the menu scene', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('ZeroClaw Phaser Starter')
  const canvas = page.locator('canvas')

  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await expect(canvas).toHaveAttribute('data-menu-has-save', 'false')
})

test('guards Continue when no save exists, then starts the game scene and follows the player camera', async ({
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
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-map-width', '800')

  await page.keyboard.down('ArrowRight')
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return Number(canvasElement?.dataset.playerX ?? '0') > 300
  })
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return Number(canvasElement?.dataset.cameraScrollX ?? '0') > 0
  })
  await page.keyboard.up('ArrowRight')
})

test('game scene keeps the camera inside world bounds while the player moves', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('ArrowDown')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'continue')
  await page.keyboard.press('ArrowUp')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')

  await page.keyboard.down('ArrowRight')
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return Number(canvasElement?.dataset.cameraScrollX ?? '0') >= 100
  })
  await page.keyboard.up('ArrowRight')

  const cameraScrollX = Number(
    (await canvas.getAttribute('data-camera-scroll-x')) ?? '0',
  )
  const mapWidth = Number((await canvas.getAttribute('data-map-width')) ?? '0')

  expect(cameraScrollX).toBeGreaterThanOrEqual(0)
  expect(cameraScrollX).toBeLessThanOrEqual(mapWidth)
})
