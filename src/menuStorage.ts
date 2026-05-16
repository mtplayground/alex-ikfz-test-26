export const MENU_STORAGE_KEY = 'zeroclaw.menu.save'

export interface MenuSaveData {
  hasSave: boolean
  highScore: number
  currentLevel: string
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const DEFAULT_LEVEL = '1-1'

const DEFAULT_MENU_SAVE: MenuSaveData = {
  hasSave: false,
  highScore: 0,
  currentLevel: DEFAULT_LEVEL,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

export function getDefaultMenuSave(levels: readonly string[]): MenuSaveData {
  return {
    ...DEFAULT_MENU_SAVE,
    currentLevel: levels[0] ?? DEFAULT_LEVEL,
  }
}

export function readMenuSave(
  storage: StorageLike | undefined,
  levels: readonly string[],
): MenuSaveData {
  const fallback = getDefaultMenuSave(levels)

  if (storage === undefined) {
    return fallback
  }

  const rawValue = storage.getItem(MENU_STORAGE_KEY)

  if (rawValue === null) {
    return fallback
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isRecord(parsedValue)) {
      return fallback
    }

    return {
      hasSave: readBoolean(parsedValue.hasSave, fallback.hasSave),
      highScore: readNumber(parsedValue.highScore, fallback.highScore),
      currentLevel: readString(parsedValue.currentLevel, fallback.currentLevel),
    }
  } catch {
    return fallback
  }
}

export function writeMenuSave(
  storage: StorageLike | undefined,
  value: MenuSaveData,
): void {
  if (storage === undefined) {
    return
  }

  storage.setItem(MENU_STORAGE_KEY, JSON.stringify(value))
}

export function resetMenuSave(
  storage: StorageLike | undefined,
  levels: readonly string[],
): MenuSaveData {
  const fallback = getDefaultMenuSave(levels)

  if (storage !== undefined) {
    storage.removeItem(MENU_STORAGE_KEY)
  }

  return fallback
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
