import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'zeroclaw.storage.v1'

test('completes a short stage by keyboard input and persists the high score', async ({
  page,
}) => {
  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        highScore: 0,
        furthestStage: '1-2',
      }),
    )
  }, STORAGE_KEY)

  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await expect(canvas).toHaveAttribute('data-menu-has-save', 'true')

  await page.keyboard.press('ArrowDown')
  await expect(canvas).toHaveAttribute('data-menu-selection', 'continue')
  await page.keyboard.press('Enter')

  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-stage-id', '1-2')

  await page.evaluate(() => {
    const game = (
      window as typeof window & {
        __zeroclawGame?: {
          scene: {
            getScene(key: string): Record<string, unknown>
          }
        }
      }
    ).__zeroclawGame

    const scene = game?.scene.getScene('game-scene')
    const player = scene?.player as
      | { x: number; y: number; setPosition: (x: number, y: number) => void }
      | undefined
    const goalPoleX = scene?.goalPoleX as number | undefined
    const goalPoleTopY = scene?.goalPoleTopY as number | undefined

    if (
      player === undefined ||
      goalPoleX === undefined ||
      goalPoleTopY === undefined
    ) {
      throw new Error(
        'Missing game-scene debug handles for stage-clear storage test.',
      )
    }

    player.setPosition(goalPoleX - 14, goalPoleTopY + 20)
  })

  await page.keyboard.down('Shift')
  await page.keyboard.down('ArrowRight')
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return canvasElement?.dataset.scene === 'game-over-scene'
  })
  await page.keyboard.up('ArrowRight')
  await page.keyboard.up('Shift')

  await expect(canvas).toHaveAttribute('data-game-over-completed-run', 'true')

  const highScore = Number(
    (await canvas.getAttribute('data-game-over-high-score')) ?? '0',
  )

  expect(highScore).toBeGreaterThan(0)

  const storedRecord = await page.evaluate((storageKey) => {
    const rawValue = window.localStorage.getItem(storageKey)

    return rawValue === null ? null : JSON.parse(rawValue)
  }, STORAGE_KEY)

  expect(storedRecord).not.toBeNull()
  expect(storedRecord?.highScore).toBe(highScore)
})
