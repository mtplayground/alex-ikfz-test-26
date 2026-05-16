export const SCENE_KEYS = {
  boot: 'boot-scene',
  menu: 'menu-scene',
} as const

export const ATLAS_ASSETS = [
  {
    key: 'player-atlas',
    textureURL: '/assets/atlases/player-atlas.png',
    atlasURL: '/assets/atlases/player-atlas.json',
  },
  {
    key: 'enemies-atlas',
    textureURL: '/assets/atlases/enemies-atlas.png',
    atlasURL: '/assets/atlases/enemies-atlas.json',
  },
  {
    key: 'items-atlas',
    textureURL: '/assets/atlases/items-atlas.png',
    atlasURL: '/assets/atlases/items-atlas.json',
  },
] as const

export const TILESET_ASSETS = [
  {
    key: 'overworld-tiles',
    textureURL: '/assets/tilesets/overworld-tiles.png',
  },
] as const

export const TILEMAP_ASSETS = [
  {
    key: 'world-1-1',
    tilemapURL: '/assets/tilemaps/world-1-1.json',
  },
] as const

export const AUDIO_ASSETS = [
  {
    key: 'overworld-theme',
    audioURL: '/assets/audio/bgm/overworld-theme.wav',
  },
  {
    key: 'jump',
    audioURL: '/assets/audio/sfx/jump.wav',
  },
  {
    key: 'coin',
    audioURL: '/assets/audio/sfx/coin.wav',
  },
  {
    key: 'powerup',
    audioURL: '/assets/audio/sfx/powerup.wav',
  },
  {
    key: 'stomp',
    audioURL: '/assets/audio/sfx/stomp.wav',
  },
] as const
