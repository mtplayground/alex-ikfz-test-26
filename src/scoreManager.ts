import type { StorageService } from '@/storageService'

const DEFAULT_STARTING_LIVES = 3
const COINS_PER_ONE_UP = 100

export interface ScoreState {
  score: number
  coins: number
  lives: number
  highScore: number
}

export interface ScoreManagerOptions {
  startingLives?: number
}

function sanitizeNonNegativeInteger(
  value: number,
  fallback: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, Math.floor(value))
}

export class ScoreManager {
  private score = 0

  private coins = 0

  private lives: number

  private readonly storageService: StorageService

  public constructor(
    storageService: StorageService,
    options: ScoreManagerOptions = {},
  ) {
    this.storageService = storageService
    this.lives = sanitizeNonNegativeInteger(
      options.startingLives ?? DEFAULT_STARTING_LIVES,
      DEFAULT_STARTING_LIVES,
    )
  }

  public getState(): ScoreState {
    return {
      score: this.score,
      coins: this.coins,
      lives: this.lives,
      highScore: this.storageService.getHighScore(),
    }
  }

  public getScore(): number {
    return this.score
  }

  public getCoins(): number {
    return this.coins
  }

  public getLives(): number {
    return this.lives
  }

  public getHighScore(): number {
    return this.storageService.getHighScore()
  }

  public addScore(points: number): number {
    const safePoints = sanitizeNonNegativeInteger(points, 0)

    this.score += safePoints

    if (this.score > this.storageService.getHighScore()) {
      this.storageService.setHighScore(this.score)
    }

    return this.score
  }

  public addCoins(amount = 1): ScoreState {
    const safeAmount = sanitizeNonNegativeInteger(amount, 0)

    if (safeAmount === 0) {
      return this.getState()
    }

    this.coins += safeAmount

    const oneUpsEarned = Math.floor(this.coins / COINS_PER_ONE_UP)

    if (oneUpsEarned > 0) {
      this.lives += oneUpsEarned
      this.coins %= COINS_PER_ONE_UP
    }

    return this.getState()
  }

  public addLife(amount = 1): number {
    const safeAmount = sanitizeNonNegativeInteger(amount, 0)

    this.lives += safeAmount

    return this.lives
  }

  public loseLife(amount = 1): number {
    const safeAmount = sanitizeNonNegativeInteger(amount, 0)

    this.lives = Math.max(0, this.lives - safeAmount)

    return this.lives
  }

  public resetRun(): ScoreState {
    this.score = 0
    this.coins = 0
    this.lives = DEFAULT_STARTING_LIVES

    return this.getState()
  }
}

let scoreManagerSingleton: ScoreManager | undefined

export function getScoreManager(
  storageService: StorageService,
  options: ScoreManagerOptions = {},
): ScoreManager {
  if (scoreManagerSingleton === undefined) {
    scoreManagerSingleton = new ScoreManager(storageService, options)
  }

  return scoreManagerSingleton
}

export function resetScoreManagerSingleton(): void {
  scoreManagerSingleton = undefined
}
