export const SCENE_KEYS = {
  boot: 'boot-scene',
  menu: 'menu-scene',
  playerPreview: 'player-preview-scene',
  game: 'game-scene',
} as const

export const ASSET_KEYS = {
  atlases: {
    player: 'player-atlas',
    enemies: 'enemies-atlas',
    items: 'items-atlas',
  },
  tilesets: {
    overworld: 'overworld-tiles',
  },
  tilemaps: {
    world11: 'world-1-1',
  },
  audio: {
    overworldTheme: 'overworld-theme',
    jump: 'jump',
    coin: 'coin',
    powerup: 'powerup',
    stomp: 'stomp',
  },
} as const

export const ATLAS_ASSETS = [
  {
    key: ASSET_KEYS.atlases.player,
    textureURL: '/assets/atlases/player-atlas.png',
    atlasURL: '/assets/atlases/player-atlas.json',
  },
  {
    key: ASSET_KEYS.atlases.enemies,
    textureURL: '/assets/atlases/enemies-atlas.png',
    atlasURL: '/assets/atlases/enemies-atlas.json',
  },
  {
    key: ASSET_KEYS.atlases.items,
    textureURL: '/assets/atlases/items-atlas.png',
    atlasURL: '/assets/atlases/items-atlas.json',
  },
] as const

export const TILESET_ASSETS = [
  {
    key: ASSET_KEYS.tilesets.overworld,
    textureURL: '/assets/tilesets/overworld-tiles.png',
  },
] as const

export const TILEMAP_ASSETS = [
  {
    key: ASSET_KEYS.tilemaps.world11,
    tilemapURL: '/assets/tilemaps/world-1-1.json',
  },
] as const

export const AUDIO_ASSETS = [
  {
    key: ASSET_KEYS.audio.overworldTheme,
    audioURL: '/assets/audio/bgm/overworld-theme.wav',
  },
  {
    key: ASSET_KEYS.audio.jump,
    audioURL: '/assets/audio/sfx/jump.wav',
  },
  {
    key: ASSET_KEYS.audio.coin,
    audioURL: '/assets/audio/sfx/coin.wav',
  },
  {
    key: ASSET_KEYS.audio.powerup,
    audioURL: '/assets/audio/sfx/powerup.wav',
  },
  {
    key: ASSET_KEYS.audio.stomp,
    audioURL: '/assets/audio/sfx/stomp.wav',
  },
] as const

export const ASSET_MANIFEST = {
  atlases: ATLAS_ASSETS,
  tilesets: TILESET_ASSETS,
  tilemaps: TILEMAP_ASSETS,
  audio: AUDIO_ASSETS,
} as const

export const CODE_REFERENCED_ASSET_KEYS = {
  bootScene: [
    ASSET_KEYS.atlases.player,
    ASSET_KEYS.atlases.enemies,
    ASSET_KEYS.atlases.items,
    ASSET_KEYS.tilesets.overworld,
    ASSET_KEYS.tilemaps.world11,
    ASSET_KEYS.audio.overworldTheme,
    ASSET_KEYS.audio.jump,
    ASSET_KEYS.audio.coin,
    ASSET_KEYS.audio.powerup,
    ASSET_KEYS.audio.stomp,
  ],
  playerPreviewScene: [ASSET_KEYS.atlases.player, ASSET_KEYS.audio.jump],
  gameScene: [
    ASSET_KEYS.atlases.player,
    ASSET_KEYS.tilesets.overworld,
    ASSET_KEYS.tilemaps.world11,
    ASSET_KEYS.audio.overworldTheme,
    ASSET_KEYS.audio.jump,
  ],
} as const
