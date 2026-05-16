export const STORAGE_KEY = 'zeroclaw.storage.v1'
export const LEGACY_MENU_STORAGE_KEY = 'zeroclaw.menu.save'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

interface StorageRecordV1 {
  version: 1
  highScore: number
  furthestStage: string | null
}

interface LegacyMenuSaveRecord {
  hasSave?: unknown
  highScore?: unknown
  currentLevel?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, Math.floor(value))
}

function readStage(
  value: unknown,
  levels: readonly string[],
  fallback: string | null,
): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback
  }

  const normalizedStage = value.trim()

  if (levels.length > 0 && !levels.includes(normalizedStage)) {
    return fallback
  }

  return normalizedStage
}

function getDefaultStage(levels: readonly string[]): string | null {
  return levels[0] ?? null
}

function createDefaultRecord(): StorageRecordV1 {
  return {
    version: 1,
    highScore: 0,
    furthestStage: null,
  }
}

function parseStorageRecord(
  rawValue: string | null,
  levels: readonly string[],
): StorageRecordV1 | undefined {
  if (rawValue === null) {
    return undefined
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isRecord(parsedValue) || parsedValue.version !== 1) {
      return undefined
    }

    return {
      version: 1,
      highScore: readFiniteNumber(parsedValue.highScore, 0),
      furthestStage: readStage(parsedValue.furthestStage, levels, null),
    }
  } catch {
    return undefined
  }
}

function parseLegacyRecord(
  rawValue: string | null,
  levels: readonly string[],
): StorageRecordV1 | undefined {
  if (rawValue === null) {
    return undefined
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isRecord(parsedValue)) {
      return undefined
    }

    const legacyRecord = parsedValue as LegacyMenuSaveRecord
    const defaultStage = getDefaultStage(levels)
    const hasSave = legacyRecord.hasSave === true

    return {
      version: 1,
      highScore: readFiniteNumber(legacyRecord.highScore, 0),
      furthestStage: hasSave
        ? readStage(legacyRecord.currentLevel, levels, defaultStage)
        : null,
    }
  } catch {
    return undefined
  }
}

function writeStorageRecord(
  storage: StorageLike | undefined,
  record: StorageRecordV1,
): void {
  if (storage === undefined) {
    return
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export class StorageService {
  private readonly storage: StorageLike | undefined

  private readonly levels: readonly string[]

  public constructor(
    storage: StorageLike | undefined,
    levels: readonly string[],
  ) {
    this.storage = storage
    this.levels = levels
  }

  public getHighScore(): number {
    return this.readRecord().highScore
  }

  public setHighScore(highScore: number): void {
    const currentRecord = this.readRecord()

    writeStorageRecord(this.storage, {
      ...currentRecord,
      highScore: readFiniteNumber(highScore, currentRecord.highScore),
    })
  }

  public getFurthestStage(): string | null {
    return this.readRecord().furthestStage
  }

  public setFurthestStage(stage: string | null): void {
    const currentRecord = this.readRecord()

    writeStorageRecord(this.storage, {
      ...currentRecord,
      furthestStage: readStage(stage, this.levels, null),
    })
  }

  public reset(): void {
    if (this.storage === undefined) {
      return
    }

    this.storage.removeItem(STORAGE_KEY)
    this.storage.removeItem(LEGACY_MENU_STORAGE_KEY)
  }

  private readRecord(): StorageRecordV1 {
    const fallback = createDefaultRecord()

    if (this.storage === undefined) {
      return fallback
    }

    const currentRecord = parseStorageRecord(
      this.storage.getItem(STORAGE_KEY),
      this.levels,
    )

    if (currentRecord !== undefined) {
      return currentRecord
    }

    const legacyRecord = parseLegacyRecord(
      this.storage.getItem(LEGACY_MENU_STORAGE_KEY),
      this.levels,
    )

    if (legacyRecord !== undefined) {
      writeStorageRecord(this.storage, legacyRecord)
      return legacyRecord
    }

    return fallback
  }
}

export function resolveBrowserStorage(): StorageLike | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function createStorageService(
  levels: readonly string[],
  storage = resolveBrowserStorage(),
): StorageService {
  return new StorageService(storage, levels)
}
