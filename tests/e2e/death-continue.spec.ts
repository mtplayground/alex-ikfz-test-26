import { expect, test } from '@playwright/test'

test('enemy damage consumes lives, retries the stage, and returns to the menu when lives are exhausted', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-lives', '3')

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

    const scene = game?.scene.getScene('game-scene') as
      | {
          player?: { defeat: () => void }
          startGameOverSequence?: (reason: 'defeat' | 'timeout') => void
        }
      | undefined

    if (
      scene?.player === undefined ||
      scene.startGameOverSequence === undefined
    ) {
      throw new Error('Missing defeat hooks for retry flow test.')
    }

    scene.player.defeat()
    scene.startGameOverSequence('defeat')
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return canvasElement?.dataset.scene === 'game-over-scene'
  })

  await expect(canvas).toHaveAttribute('data-game-over-reason', 'defeat')
  await expect(canvas).toHaveAttribute('data-game-over-lives', '2')
  await expect(canvas).toHaveAttribute('data-game-over-retry-available', 'true')

  await page.keyboard.press('Enter')
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.scene === 'game-scene' &&
      canvasElement?.dataset.stageId === '1-1' &&
      canvasElement?.dataset.lives === '2'
    )
  })

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

    const scene = game?.scene.getScene('game-scene') as
      | {
          scoreManager?: { loseLife: (amount: number) => number }
          player?: { defeat: () => void }
          startGameOverSequence?: (reason: 'defeat' | 'timeout') => void
        }
      | undefined

    if (
      scene?.scoreManager === undefined ||
      scene.player === undefined ||
      scene.startGameOverSequence === undefined
    ) {
      throw new Error('Missing zero-life hooks for menu return test.')
    }

    scene.scoreManager.loseLife(1)
    scene.player.defeat()
    scene.startGameOverSequence('defeat')
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return canvasElement?.dataset.scene === 'game-over-scene'
  })

  await expect(canvas).toHaveAttribute('data-game-over-lives', '0')
  await expect(canvas).toHaveAttribute(
    'data-game-over-retry-available',
    'false',
  )

  await page.keyboard.press('Enter')
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.scene === 'menu-scene' ||
      canvasElement?.dataset.menuSelection === 'start'
    )
  })
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
})
