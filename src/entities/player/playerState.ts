export type PlayerPowerState = 'small' | 'big' | 'fire'
export type PlayerLifeState = PlayerPowerState | 'dead'

export interface PlayerDamageResult {
  accepted: boolean
  defeated: boolean
  nextState: PlayerLifeState
  grantsInvulnerability: boolean
}

export function resolvePowerStateUpgrade(
  currentState: PlayerLifeState,
  targetState: PlayerPowerState,
): PlayerLifeState {
  if (currentState === 'dead') {
    return 'dead'
  }

  if (targetState === 'fire') {
    return 'fire'
  }

  if (targetState === 'big' && currentState === 'small') {
    return 'big'
  }

  return currentState
}

export function resolveDamageState(
  currentState: PlayerLifeState,
  isInvulnerable: boolean,
): PlayerDamageResult {
  if (currentState === 'dead' || isInvulnerable) {
    return {
      accepted: false,
      defeated: currentState === 'dead',
      nextState: currentState,
      grantsInvulnerability: false,
    }
  }

  if (currentState === 'fire') {
    return {
      accepted: true,
      defeated: false,
      nextState: 'big',
      grantsInvulnerability: true,
    }
  }

  if (currentState === 'big') {
    return {
      accepted: true,
      defeated: false,
      nextState: 'small',
      grantsInvulnerability: true,
    }
  }

  return {
    accepted: true,
    defeated: true,
    nextState: 'dead',
    grantsInvulnerability: false,
  }
}
