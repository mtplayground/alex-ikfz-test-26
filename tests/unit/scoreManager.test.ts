import { beforeEach, describe, expect, it } from 'vitest'

import {
  getScoreManager,
  resetScoreManagerSingleton,
  ScoreManager,
} from '@/scoreManager'
import { createStorageService, type StorageLike } from '@/storageService'

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>()

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  public removeItem(key: string): void {
    this.values.delete(key)
  }
}

function createManager() {
  const storage = new MemoryStorage()
  const storageService = createStorageService(['1-1', '1-2'], storage)

  return {
    storage,
    storageService,
    manager: new ScoreManager(storageService),
  }
}

describe('scoreManager', () => {
  beforeEach(() => {
    resetScoreManagerSingleton()
  })

  it('accumulates score across multiple additions', () => {
    const { manager } = createManager()

    expect(manager.addScore(100)).toBe(100)
    expect(manager.addScore(250)).toBe(350)
    expect(manager.getScore()).toBe(350)
  })

  it('tracks score, coins, lives, and high score state', () => {
    const { manager } = createManager()

    manager.addScore(500)
    manager.addCoins(12)

    expect(manager.getState()).toEqual({
      score: 500,
      coins: 12,
      lives: 3,
      highScore: 500,
    })
  })

  it('awards one extra life for every 100 collected coins', () => {
    const { manager } = createManager()

    manager.addCoins(250)

    expect(manager.getCoins()).toBe(50)
    expect(manager.getLives()).toBe(5)
  })

  it('triggers exactly one 1-up at 100 coins and carries over remaining coins', () => {
    const { manager } = createManager()

    manager.addCoins(99)
    expect(manager.getCoins()).toBe(99)
    expect(manager.getLives()).toBe(3)

    manager.addCoins(1)
    expect(manager.getCoins()).toBe(0)
    expect(manager.getLives()).toBe(4)

    manager.addCoins(25)
    expect(manager.getCoins()).toBe(25)
    expect(manager.getLives()).toBe(4)
  })

  it('writes back the highest score when a new record is reached', () => {
    const { manager, storageService } = createManager()

    storageService.setHighScore(1200)

    manager.addScore(1000)
    expect(storageService.getHighScore()).toBe(1200)

    manager.addScore(300)
    expect(storageService.getHighScore()).toBe(1300)
  })

  it('never drops lives below zero', () => {
    const { manager } = createManager()

    manager.loseLife(99)

    expect(manager.getLives()).toBe(0)
  })

  it('reuses the singleton instance until explicitly reset', () => {
    const storageService = createStorageService(['1-1', '1-2'], new MemoryStorage())

    const firstManager = getScoreManager(storageService)
    const secondManager = getScoreManager(storageService)

    expect(secondManager).toBe(firstManager)

    resetScoreManagerSingleton()

    const thirdManager = getScoreManager(storageService)

    expect(thirdManager).not.toBe(firstManager)
  })
})
