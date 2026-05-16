import { ASSET_KEYS } from '@/assets'
import type { BgmKey } from '@/audioManager'

export interface StageDefinition {
  id: string
  tilemapKey: (typeof ASSET_KEYS.tilemaps)[keyof typeof ASSET_KEYS.tilemaps]
  bgmKey: BgmKey
  nextStageId: string | null
}

export const STAGE_REGISTRY = [
  {
    id: '1-1',
    tilemapKey: ASSET_KEYS.tilemaps.world11,
    bgmKey: ASSET_KEYS.audio.overworldTheme,
    nextStageId: '1-2',
  },
  {
    id: '1-2',
    tilemapKey: ASSET_KEYS.tilemaps.world12,
    bgmKey: ASSET_KEYS.audio.overworldTheme,
    nextStageId: null,
  },
] as const satisfies readonly StageDefinition[]

export const STAGE_IDS = STAGE_REGISTRY.map((stage) => stage.id)

export function getFirstStageId(): string {
  return STAGE_REGISTRY[0]?.id ?? '1-1'
}

export function getStageDefinition(
  stageId: string | null | undefined,
): StageDefinition | undefined {
  if (stageId === undefined || stageId === null) {
    return undefined
  }

  return STAGE_REGISTRY.find((stage) => stage.id === stageId)
}

export function resolveNextStageId(currentStageId: string): string | null {
  return getStageDefinition(currentStageId)?.nextStageId ?? null
}
