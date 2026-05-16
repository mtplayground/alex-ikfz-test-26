const FLAGPOLE_BONUS_STEPS = [
  { threshold: 0.2, points: 5000 },
  { threshold: 0.45, points: 2000 },
  { threshold: 0.7, points: 800 },
  { threshold: 1, points: 400 },
] as const

export function resolveFlagpoleBonus(normalizedContactHeight: number): number {
  const clampedHeight = Math.min(Math.max(normalizedContactHeight, 0), 1)

  for (const step of FLAGPOLE_BONUS_STEPS) {
    if (clampedHeight <= step.threshold) {
      return step.points
    }
  }

  return FLAGPOLE_BONUS_STEPS[FLAGPOLE_BONUS_STEPS.length - 1]?.points ?? 400
}

export function resolveNextStage(
  levels: readonly string[],
  currentStage: string,
): string | null {
  const currentStageIndex = levels.indexOf(currentStage)

  if (currentStageIndex < 0) {
    return levels[0] ?? null
  }

  return levels[currentStageIndex + 1] ?? null
}
