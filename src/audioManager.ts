import type Phaser from 'phaser'

import { ASSET_KEYS } from '@/assets'

export type BgmKey = (typeof ASSET_KEYS.audio)[keyof Pick<
  typeof ASSET_KEYS.audio,
  'overworldTheme'
>]

export type SfxKey = Exclude<
  (typeof ASSET_KEYS.audio)[keyof typeof ASSET_KEYS.audio],
  BgmKey
>

export interface AudioManagerState {
  currentBgmKey: string | null
  unlocked: boolean
  registeredSfxKeys: string[]
}

interface SoundInstanceLike {
  isPlaying?: boolean
  play(config?: unknown): boolean
  stop(): void
}

interface SoundManagerLike {
  locked?: boolean
  add(key: string): SoundInstanceLike
  play(key: string, config?: unknown): boolean
  stopByKey?(key: string): number
  context?: {
    resume?: () => Promise<unknown> | unknown
  }
}

interface KeyboardPluginLike {
  once?(event: string, callback: () => void): void
}

interface InputPluginLike {
  once?(event: string, callback: () => void): void
  keyboard?: KeyboardPluginLike | null
}

type SceneLike = Pick<Phaser.Scene, 'game'> & {
  input?: InputPluginLike
  sound: SoundManagerLike
}

const DEFAULT_BGM_LOOP_CONFIG = {
  loop: true,
  volume: 0.5,
} as const

const DEFAULT_SFX_KEYS = [
  ASSET_KEYS.audio.stageClear,
  ASSET_KEYS.audio.jump,
  ASSET_KEYS.audio.coin,
  ASSET_KEYS.audio.powerup,
  ASSET_KEYS.audio.stomp,
] as const satisfies readonly SfxKey[]

export class AudioManager {
  private currentBgmKey: string | null = null

  private currentBgm?: SoundInstanceLike

  private unlocked = false

  private unlockListenersBound = false

  private readonly registeredSfxKeys = new Set<string>()

  public constructor(private readonly scene: SceneLike) {
    this.unlocked = !this.scene.sound.locked
  }

  public registerDefaultSfx(): void {
    for (const key of DEFAULT_SFX_KEYS) {
      this.registerSfxKey(key)
    }
  }

  public registerSfxKey(key: SfxKey): void {
    this.registeredSfxKeys.add(key)
  }

  public getState(): AudioManagerState {
    return {
      currentBgmKey: this.currentBgmKey,
      unlocked: this.unlocked,
      registeredSfxKeys: [...this.registeredSfxKeys].sort(),
    }
  }

  public bindUnlockOnFirstInteraction(): void {
    if (this.unlocked || this.unlockListenersBound) {
      return
    }

    this.unlockListenersBound = true

    const unlockAudio = () => {
      void this.unlockAudio()
    }

    this.scene.input?.once?.('pointerdown', unlockAudio)
    this.scene.input?.keyboard?.once?.('keydown', unlockAudio)
  }

  public async unlockAudio(): Promise<void> {
    if (this.unlocked) {
      return
    }

    await this.scene.sound.context?.resume?.()
    this.unlocked = true
  }

  public playBgm(key: BgmKey): void {
    if (this.currentBgmKey === key && this.currentBgm?.isPlaying === true) {
      return
    }

    this.stopBgm()
    this.currentBgmKey = key
    this.currentBgm = this.scene.sound.add(key)
    this.currentBgm.play(DEFAULT_BGM_LOOP_CONFIG)
  }

  public stopBgm(): void {
    this.currentBgm?.stop()

    if (
      this.currentBgmKey !== null &&
      this.currentBgm === undefined &&
      this.scene.sound.stopByKey !== undefined
    ) {
      this.scene.sound.stopByKey(this.currentBgmKey)
    }

    this.currentBgm = undefined
    this.currentBgmKey = null
  }

  public switchBgm(key: BgmKey): void {
    this.playBgm(key)
  }

  public playSfx(key: SfxKey): boolean {
    if (!this.registeredSfxKeys.has(key)) {
      return false
    }

    return this.scene.sound.play(key)
  }
}

const audioManagerStore = new WeakMap<object, AudioManager>()

export function getAudioManager(scene: Phaser.Scene): AudioManager {
  const gameKey = scene.game as object
  const existingManager = audioManagerStore.get(gameKey)

  if (existingManager !== undefined) {
    return existingManager
  }

  const manager = new AudioManager(scene)
  audioManagerStore.set(gameKey, manager)

  return manager
}

export function resetAudioManager(scene: Phaser.Scene): void {
  audioManagerStore.delete(scene.game as object)
}
