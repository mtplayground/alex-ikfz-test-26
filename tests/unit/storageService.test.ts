import { describe, expect, it } from 'vitest'

import {
  createStorageService,
  LEGACY_MENU_STORAGE_KEY,
  STORAGE_KEY,
  type StorageLike,
} from '@/storageService'

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

describe('storageService', () => {
  it('returns defaults when storage is empty', () => {
    const service = createStorageService(['1-1', '1-2'], new MemoryStorage())

    expect(service.getHighScore()).toBe(0)
    expect(service.getFurthestStage()).toBeNull()
  })

  it('writes and reads the current schema', () => {
    const storage = new MemoryStorage()
    const service = createStorageService(['1-1', '1-2'], storage)

    service.setHighScore(4200)
    service.setFurthestStage('1-2')

    expect(service.getHighScore()).toBe(4200)
    expect(service.getFurthestStage()).toBe('1-2')
    expect(storage.getItem(STORAGE_KEY)).toContain('"version":1')
  })

  it('migrates legacy menu save data to the new schema', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      LEGACY_MENU_STORAGE_KEY,
      JSON.stringify({
        hasSave: true,
        highScore: 3200,
        currentLevel: '1-2',
      }),
    )

    const service = createStorageService(['1-1', '1-2'], storage)

    expect(service.getHighScore()).toBe(3200)
    expect(service.getFurthestStage()).toBe('1-2')
    expect(storage.getItem(STORAGE_KEY)).toContain('"furthestStage":"1-2"')
  })

  it('downgrades invalid schema values to safe defaults', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        highScore: 'oops',
        furthestStage: '9-9',
      }),
    )

    const service = createStorageService(['1-1', '1-2'], storage)

    expect(service.getHighScore()).toBe(0)
    expect(service.getFurthestStage()).toBeNull()
  })

  it('removes both current and legacy payloads on reset', () => {
    const storage = new MemoryStorage()
    const service = createStorageService(['1-1', '1-2'], storage)

    service.setHighScore(999)
    service.setFurthestStage('1-2')
    storage.setItem(LEGACY_MENU_STORAGE_KEY, '{"hasSave":true}')

    service.reset()

    expect(service.getHighScore()).toBe(0)
    expect(service.getFurthestStage()).toBeNull()
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    expect(storage.getItem(LEGACY_MENU_STORAGE_KEY)).toBeNull()
  })
})
