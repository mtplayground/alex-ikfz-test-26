/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_TITLE?: string
  readonly VITE_CANVAS_WIDTH?: string
  readonly VITE_CANVAS_HEIGHT?: string
  readonly VITE_GRAVITY_Y?: string
  readonly VITE_PLAYER_WALK_SPEED?: string
  readonly VITE_PLAYER_RUN_SPEED?: string
  readonly VITE_LEVELS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
