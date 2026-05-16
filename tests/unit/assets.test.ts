import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  ASSET_KEYS,
  ASSET_MANIFEST,
  ATLAS_ASSETS,
  AUDIO_ASSETS,
  CODE_REFERENCED_ASSET_KEYS,
  TILEMAP_ASSETS,
  TILESET_ASSETS,
} from '@/assets'

const workspaceRoot = process.cwd()
const publicRoot = join(workspaceRoot, 'public')

function flattenValues(record: Record<string, string>): string[] {
  return Object.values(record)
}

describe('asset manifest integrity', () => {
  it('lists every code-referenced asset key in the manifest', () => {
    const manifestKeys = new Set([
      ...ATLAS_ASSETS.map((asset) => asset.key),
      ...TILESET_ASSETS.map((asset) => asset.key),
      ...TILEMAP_ASSETS.map((asset) => asset.key),
      ...AUDIO_ASSETS.map((asset) => asset.key),
    ])

    for (const referencedKeys of Object.values(CODE_REFERENCED_ASSET_KEYS)) {
      for (const key of referencedKeys) {
        expect(
          manifestKeys.has(key),
          `Expected asset key "${key}" to exist in the manifest.`,
        ).toBe(true)
      }
    }
  })

  it('keeps the exported asset key catalog in sync with the manifest', () => {
    const manifestKeys = {
      atlases: ATLAS_ASSETS.map((asset) => asset.key),
      tilesets: TILESET_ASSETS.map((asset) => asset.key),
      tilemaps: TILEMAP_ASSETS.map((asset) => asset.key),
      audio: AUDIO_ASSETS.map((asset) => asset.key),
    }

    expect(manifestKeys.atlases).toEqual(flattenValues(ASSET_KEYS.atlases))
    expect(manifestKeys.tilesets).toEqual(flattenValues(ASSET_KEYS.tilesets))
    expect(manifestKeys.tilemaps).toEqual(flattenValues(ASSET_KEYS.tilemaps))
    expect(manifestKeys.audio).toEqual(flattenValues(ASSET_KEYS.audio))
  })

  it('points every manifest file at a real asset under public/', () => {
    const atlasFiles = ASSET_MANIFEST.atlases.flatMap((asset) => [
      asset.textureURL,
      asset.atlasURL,
    ])
    const tilesetFiles = ASSET_MANIFEST.tilesets.map(
      (asset) => asset.textureURL,
    )
    const tilemapFiles = ASSET_MANIFEST.tilemaps.map(
      (asset) => asset.tilemapURL,
    )
    const audioFiles = ASSET_MANIFEST.audio.map((asset) => asset.audioURL)

    for (const assetPath of [
      ...atlasFiles,
      ...tilesetFiles,
      ...tilemapFiles,
      ...audioFiles,
    ]) {
      expect(
        existsSync(join(publicRoot, assetPath.replace(/^\//, ''))),
        `Expected asset file "${assetPath}" to exist under public/.`,
      ).toBe(true)
    }
  })

  it('does not duplicate manifest keys across asset groups', () => {
    const allManifestKeys = [
      ...ATLAS_ASSETS.map((asset) => asset.key),
      ...TILESET_ASSETS.map((asset) => asset.key),
      ...TILEMAP_ASSETS.map((asset) => asset.key),
      ...AUDIO_ASSETS.map((asset) => asset.key),
    ]

    expect(new Set(allManifestKeys).size).toBe(allManifestKeys.length)
  })
})
