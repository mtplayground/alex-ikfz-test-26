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

test('game scene HUD reflects score, coins, world, lives, and the ticking timer', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-hud-stage', '1-1')
  await expect(canvas).toHaveAttribute('data-hud-score', '000000')
  await expect(canvas).toHaveAttribute('data-hud-coins', '00')
  await expect(canvas).toHaveAttribute('data-hud-lives', '03')

  const initialHudTime = Number(
    (await canvas.getAttribute('data-hud-time')) ?? '0',
  )

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
    const collectibles = scene?.collectibles as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const collectible = collectibles?.getChildren()?.[0] as
      | Record<string, unknown>
      | undefined
    const handlePlayerCollectibleCollision =
      scene?.handlePlayerCollectibleCollision as
        | ((collectible: Record<string, unknown>) => void)
        | undefined

    if (
      collectible === undefined ||
      handlePlayerCollectibleCollision === undefined
    ) {
      throw new Error('Missing game-scene debug handles for HUD test.')
    }

    handlePlayerCollectibleCollision.call(scene, collectible)
  })

  await expect(canvas).toHaveAttribute('data-hud-score', '000200')
  await expect(canvas).toHaveAttribute('data-hud-coins', '01')

  await page.waitForFunction((previousHudTime) => {
    const canvasElement = document.querySelector('canvas')
    const currentHudTime = Number(canvasElement?.dataset.hudTime ?? '0')

    return currentHudTime < previousHudTime
  }, initialHudTime)
})

test('reaching the goal flagpole advances to the next configured stage', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-stage-id', '1-1')

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
      | { setPosition: (x: number, y: number) => void }
      | undefined
    const goalPoleX = scene?.goalPoleX as number | undefined
    const goalPoleTopY = scene?.goalPoleTopY as number | undefined

    if (
      player === undefined ||
      goalPoleX === undefined ||
      goalPoleTopY === undefined
    ) {
      throw new Error('Missing game-scene debug handles for goal test.')
    }

    player.setPosition(goalPoleX, goalPoleTopY + 20)
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.scene === 'game-scene' &&
      canvasElement?.dataset.stageId === '1-2'
    )
  })
  await expect(canvas).toHaveAttribute('data-goal-state', 'idle')
  await expect(canvas).toHaveAttribute('data-stage-id', '1-2')
})

test('goomba stomp removes the enemy', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-goomba-count', '1')

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
      | {
          setPosition: (x: number, y: number) => void
          body?: {
            height: number
            position: { x: number; y: number }
            setVelocity: (x: number, y: number) => void
          }
        }
      | undefined
    const goombas = scene?.goombas as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const goomba = goombas?.getChildren()?.[0] as
      | { x: number; y: number; body?: { top: number } }
      | undefined
    const handlePlayerGoombaCollision = scene?.handlePlayerGoombaCollision as
      | ((goomba: Record<string, unknown>) => void)
      | undefined

    if (player === undefined || goomba === undefined) {
      throw new Error('Missing game-scene debug handles for goomba stomp test.')
    }

    if (handlePlayerGoombaCollision === undefined) {
      throw new Error('Missing goomba collision handler for stomp test.')
    }

    if (player.body === undefined || goomba.body === undefined) {
      throw new Error('Missing physics bodies for goomba stomp test.')
    }

    player.setPosition(goomba.x, goomba.y - 26)
    player.body.position.y = goomba.body.top - player.body.height - 2
    player.body?.setVelocity(0, 240)
    handlePlayerGoombaCollision.call(scene, goomba)
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.goombaCount === '0' &&
      canvasElement?.dataset.lastEnemyInteraction === 'stomp'
    )
  })
})

test('goomba side contact damages the player', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-goomba-count', '1')

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
      | { forcePowerState: (state: 'small' | 'big' | 'fire') => void }
      | undefined
    const handlePlayerGoombaCollision = scene?.handlePlayerGoombaCollision as
      | ((goomba: Record<string, unknown>) => void)
      | undefined
    const goombas = scene?.goombas as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const goomba = goombas?.getChildren()?.[0] as
      | { x: number; y: number }
      | undefined
    const runtimePlayer = scene?.player as
      | {
          setPosition: (x: number, y: number) => void
          body?: { setVelocity: (x: number, y: number) => void }
        }
      | undefined

    if (
      player === undefined ||
      runtimePlayer === undefined ||
      goomba === undefined ||
      handlePlayerGoombaCollision === undefined
    ) {
      throw new Error(
        'Missing game-scene debug handles for goomba side-hit test.',
      )
    }

    player.forcePowerState('big')
    runtimePlayer.setPosition(goomba.x - 10, goomba.y)
    runtimePlayer.body?.setVelocity(40, 0)
    handlePlayerGoombaCollision.call(scene, goomba)
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.lastEnemyInteraction === 'hurt' &&
      canvasElement?.dataset.playerPowerState === 'small'
    )
  })
})

test('koopa stomp creates a shell, kicking it defeats a goomba', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-koopa-count', '1')
  await expect(canvas).toHaveAttribute('data-goomba-count', '1')

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
      | {
          x: number
          y: number
          setPosition: (x: number, y: number) => void
          body?: {
            bottom: number
            height: number
            position: { y: number }
            setVelocity: (x: number, y: number) => void
          }
        }
      | undefined
    const koopas = scene?.koopas as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const goombas = scene?.goombas as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const koopa = koopas?.getChildren()?.[0] as
      | { x: number; y: number; body?: { top: number } }
      | undefined
    const goomba = goombas?.getChildren()?.[0] as
      | Record<string, unknown>
      | undefined
    const handlePlayerKoopaCollision = scene?.handlePlayerKoopaCollision as
      | ((koopa: Record<string, unknown>) => void)
      | undefined
    const handleKoopaGoombaCollision = scene?.handleKoopaGoombaCollision as
      | ((
          koopa: Record<string, unknown>,
          goomba: Record<string, unknown>,
        ) => void)
      | undefined

    if (
      player === undefined ||
      player.body === undefined ||
      koopa === undefined ||
      koopa.body === undefined ||
      goomba === undefined ||
      handlePlayerKoopaCollision === undefined ||
      handleKoopaGoombaCollision === undefined
    ) {
      throw new Error('Missing game-scene debug handles for koopa shell test.')
    }

    player.setPosition(koopa.x, koopa.y - 26)
    player.body.position.y = koopa.body.top - player.body.height - 2
    player.body.setVelocity(0, 240)
    handlePlayerKoopaCollision.call(scene, koopa)

    player.setPosition(koopa.x - 12, koopa.y)
    player.body.setVelocity(60, 0)
    handlePlayerKoopaCollision.call(scene, koopa)
    handleKoopaGoombaCollision.call(scene, koopa, goomba)
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.koopaState === 'shell-sliding' &&
      canvasElement?.dataset.goombaCount === '0' &&
      canvasElement?.dataset.lastEnemyInteraction === 'koopa-shell-kill'
    )
  })
})

test('a sliding koopa shell damages the player', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')

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
      | {
          forcePowerState: (state: 'small' | 'big' | 'fire') => void
          setPosition: (x: number, y: number) => void
          body?: {
            height: number
            position: { y: number }
            setVelocity: (x: number, y: number) => void
          }
        }
      | undefined
    const koopas = scene?.koopas as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const koopa = koopas?.getChildren()?.[0] as
      | { x: number; y: number; body?: { top: number } }
      | undefined
    const handlePlayerKoopaCollision = scene?.handlePlayerKoopaCollision as
      | ((koopa: Record<string, unknown>) => void)
      | undefined

    if (
      player === undefined ||
      player.body === undefined ||
      koopa === undefined ||
      koopa.body === undefined ||
      handlePlayerKoopaCollision === undefined
    ) {
      throw new Error('Missing game-scene debug handles for koopa hurt test.')
    }

    player.forcePowerState('big')

    player.setPosition(koopa.x, koopa.y - 26)
    player.body.position.y = koopa.body.top - player.body.height - 2
    player.body.setVelocity(0, 240)
    handlePlayerKoopaCollision.call(scene, koopa)

    player.setPosition(koopa.x - 10, koopa.y)
    player.body.setVelocity(60, 0)
    handlePlayerKoopaCollision.call(scene, koopa)
    handlePlayerKoopaCollision.call(scene, koopa)
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.lastEnemyInteraction === 'koopa-shell-hurt' &&
      canvasElement?.dataset.playerPowerState === 'small'
    )
  })
})

test('collectibles apply score, power, and invulnerability effects', async ({
  page,
}) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-collectible-count', '4')

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
    const collectibles = scene?.collectibles as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const handlePlayerCollectibleCollision =
      scene?.handlePlayerCollectibleCollision as
        | ((collectible: Record<string, unknown>) => void)
        | undefined

    if (
      collectibles === undefined ||
      handlePlayerCollectibleCollision === undefined
    ) {
      throw new Error('Missing game-scene debug handles for collectible test.')
    }

    for (const collectible of collectibles.getChildren()) {
      handlePlayerCollectibleCollision.call(scene, collectible)
    }
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.collectibleCount === '0' &&
      canvasElement?.dataset.lastCollectibleEffect === 'star' &&
      canvasElement?.dataset.playerPowerState === 'fire' &&
      canvasElement?.dataset.playerInvulnerable === 'true'
    )
  })

  await expect(canvas).toHaveAttribute('data-score', '3200')
  await expect(canvas).toHaveAttribute('data-coins', '1')
})

test('fire mario shoots fireballs that defeat enemies', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('canvas')

  await canvas.click()
  await expect(canvas).toHaveAttribute('data-menu-selection', 'start')
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'game-scene')
  await expect(canvas).toHaveAttribute('data-fireball-count', '0')

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
      | {
          forcePowerState: (state: 'small' | 'big' | 'fire') => void
          setPosition: (x: number, y: number) => void
        }
      | undefined
    const tryShootFireball = scene?.tryShootFireball as (() => void) | undefined
    const fireballs = scene?.fireballs as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const goombas = scene?.goombas as
      | { getChildren: () => Array<Record<string, unknown>> }
      | undefined
    const handleFireballGoombaCollision =
      scene?.handleFireballGoombaCollision as
        | ((
            fireball: Record<string, unknown>,
            goomba: Record<string, unknown>,
          ) => void)
        | undefined

    if (
      player === undefined ||
      tryShootFireball === undefined ||
      fireballs === undefined ||
      goombas === undefined ||
      handleFireballGoombaCollision === undefined
    ) {
      throw new Error('Missing game-scene debug handles for fireball test.')
    }

    player.forcePowerState('small')
    tryShootFireball.call(scene)

    player.forcePowerState('fire')
    player.setPosition(500, 360)
    tryShootFireball.call(scene)

    const fireball = fireballs.getChildren()[0]
    const goomba = goombas.getChildren()[0]

    if (fireball === undefined || goomba === undefined) {
      throw new Error('Expected active fireball and goomba for collision test.')
    }

    handleFireballGoombaCollision.call(scene, fireball, goomba)
  })

  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')

    return (
      canvasElement?.dataset.lastProjectileEvent === 'enemy-hit' &&
      canvasElement?.dataset.goombaCount === '0'
    )
  })

  await expect(canvas).toHaveAttribute('data-score', '100')
})
