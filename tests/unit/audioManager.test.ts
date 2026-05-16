import { describe, expect, it } from 'vitest'

import { ASSET_KEYS } from '@/assets'
import { AudioManager } from '@/audioManager'

class FakeSound {
  public isPlaying = false

  public playCalls = 0

  public stopCalls = 0

  public lastConfig: unknown

  public play(config?: unknown): boolean {
    this.playCalls += 1
    this.isPlaying = true
    this.lastConfig = config
    return true
  }

  public stop(): void {
    this.stopCalls += 1
    this.isPlaying = false
  }
}

class FakeKeyboard {
  public listeners = new Map<string, () => void>()

  public once(event: string, callback: () => void): void {
    this.listeners.set(event, callback)
  }
}

class FakeInput {
  public listeners = new Map<string, () => void>()

  public keyboard = new FakeKeyboard()

  public once(event: string, callback: () => void): void {
    this.listeners.set(event, callback)
  }
}

class FakeSoundManager {
  public locked = true

  public readonly addCalls: string[] = []

  public readonly playCalls: string[] = []

  public readonly sounds = new Map<string, FakeSound>()

  public context = {
    resume: async () => {
      this.locked = false
    },
  }

  public add(key: string): FakeSound {
    this.addCalls.push(key)

    const sound = new FakeSound()
    this.sounds.set(key, sound)
    return sound
  }

  public play(key: string): boolean {
    this.playCalls.push(key)
    return true
  }
}

function createManager() {
  const sound = new FakeSoundManager()
  const input = new FakeInput()
  const scene = {
    game: {},
    input,
    sound,
  }

  return {
    input,
    sound,
    manager: new AudioManager(scene),
  }
}

describe('audioManager', () => {
  it('registers default sfx keys', () => {
    const { manager } = createManager()

    manager.registerDefaultSfx()

    expect(manager.getState().registeredSfxKeys).toEqual([
      ASSET_KEYS.audio.coin,
      ASSET_KEYS.audio.jump,
      ASSET_KEYS.audio.powerup,
      ASSET_KEYS.audio.stomp,
    ])
  })

  it('plays and switches bgm through managed sound instances', () => {
    const { manager, sound } = createManager()

    manager.playBgm(ASSET_KEYS.audio.overworldTheme)

    expect(manager.getState().currentBgmKey).toBe(ASSET_KEYS.audio.overworldTheme)
    expect(sound.addCalls).toEqual([ASSET_KEYS.audio.overworldTheme])
    expect(sound.sounds.get(ASSET_KEYS.audio.overworldTheme)?.playCalls).toBe(1)

    manager.switchBgm(ASSET_KEYS.audio.overworldTheme)

    expect(sound.addCalls).toEqual([ASSET_KEYS.audio.overworldTheme])
  })

  it('stops the current bgm and clears state', () => {
    const { manager, sound } = createManager()

    manager.playBgm(ASSET_KEYS.audio.overworldTheme)
    manager.stopBgm()

    expect(sound.sounds.get(ASSET_KEYS.audio.overworldTheme)?.stopCalls).toBe(1)
    expect(manager.getState().currentBgmKey).toBeNull()
  })

  it('only plays registered sfx keys', () => {
    const { manager, sound } = createManager()

    expect(manager.playSfx(ASSET_KEYS.audio.jump)).toBe(false)

    manager.registerDefaultSfx()

    expect(manager.playSfx(ASSET_KEYS.audio.jump)).toBe(true)
    expect(sound.playCalls).toEqual([ASSET_KEYS.audio.jump])
  })

  it('binds first-interaction unlock handlers and unlocks audio', async () => {
    const { manager, input } = createManager()

    manager.bindUnlockOnFirstInteraction()

    expect(input.listeners.has('pointerdown')).toBe(true)
    expect(input.keyboard.listeners.has('keydown')).toBe(true)

    const pointerUnlock = input.listeners.get('pointerdown')

    pointerUnlock?.()
    await Promise.resolve()

    expect(manager.getState().unlocked).toBe(true)
  })
})
