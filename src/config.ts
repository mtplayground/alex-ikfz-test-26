const DEFAULT_LEVELS = ['1-1', '1-2'] as const

function readStringEnv(value: string | undefined, fallback: string): string {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback
}

function readNumberEnv(
  value: string | undefined,
  fallback: number,
  label: string,
): number {
  if (value === undefined || value.trim().length === 0) {
    return fallback
  }

  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    throw new Error(
      `Invalid numeric environment value for ${label}: "${value}"`,
    )
  }

  return parsedValue
}

function readLevels(value: string | undefined): string[] {
  if (value === undefined || value.trim().length === 0) {
    return [...DEFAULT_LEVELS]
  }

  const levels = value
    .split(',')
    .map((level) => level.trim())
    .filter((level) => level.length > 0)

  if (levels.length === 0) {
    throw new Error('VITE_LEVELS must include at least one stage identifier.')
  }

  return levels
}

export const GAME_TITLE = readStringEnv(
  import.meta.env.VITE_GAME_TITLE,
  'ZeroClaw Phaser Starter',
)

export const GAME_CONFIG = {
  canvas: {
    width: readNumberEnv(
      import.meta.env.VITE_CANVAS_WIDTH,
      800,
      'VITE_CANVAS_WIDTH',
    ),
    height: readNumberEnv(
      import.meta.env.VITE_CANVAS_HEIGHT,
      450,
      'VITE_CANVAS_HEIGHT',
    ),
  },
  physics: {
    gravityY: readNumberEnv(
      import.meta.env.VITE_GRAVITY_Y,
      1200,
      'VITE_GRAVITY_Y',
    ),
  },
  player: {
    walkSpeed: readNumberEnv(
      import.meta.env.VITE_PLAYER_WALK_SPEED,
      180,
      'VITE_PLAYER_WALK_SPEED',
    ),
    runSpeed: readNumberEnv(
      import.meta.env.VITE_PLAYER_RUN_SPEED,
      260,
      'VITE_PLAYER_RUN_SPEED',
    ),
    jumpVelocity: -460,
    jumpReleaseVelocityCap: -190,
    smallScale: 1.5,
    poweredScale: 1.72,
    transformDurationMs: 420,
    invulnerabilityDurationMs: 1200,
    invulnerabilityBlinkIntervalMs: 90,
    starInvulnerabilityDurationMs: 5000,
  },
  levels: readLevels(import.meta.env.VITE_LEVELS),
} as const
