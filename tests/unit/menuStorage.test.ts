import { describe, expect, it } from 'vitest'

import {
  MENU_STORAGE_KEY,
  getDefaultMenuSave,
  readMenuSave,
  resetMenuSave,
  writeMenuSave,
  type StorageLike,
} from '@/menuStorage'

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

describe('menuStorage', () => {
  it('returns defaults when storage is empty', () => {
    const storage = new MemoryStorage()

    expect(readMenuSave(storage, ['1-1', '1-2'])).toEqual({
      hasSave: false,
      highScore: 0,
      currentLevel: '1-1',
    })
  })

  it('writes and reads menu save data', () => {
    const storage = new MemoryStorage()

    writeMenuSave(storage, {
      hasSave: true,
      highScore: 3200,
      currentLevel: '1-2',
    })

    expect(readMenuSave(storage, ['1-1', '1-2'])).toEqual({
      hasSave: true,
      highScore: 3200,
      currentLevel: '1-2',
    })
  })

  it('resets stored progress back to defaults', () => {
    const storage = new MemoryStorage()

    writeMenuSave(storage, {
      hasSave: true,
      highScore: 1800,
      currentLevel: '1-2',
    })

    const resetValue = resetMenuSave(storage, ['1-1', '1-2'])

    expect(resetValue).toEqual(getDefaultMenuSave(['1-1', '1-2']))
    expect(storage.getItem(MENU_STORAGE_KEY)).toBeNull()
  })
})
