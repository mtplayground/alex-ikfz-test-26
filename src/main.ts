import './style.css'

import Phaser from 'phaser'
import { GAME_CONFIG, GAME_TITLE } from '@/config'
import { BootScene } from '@/scenes/BootScene'
import { GameScene } from '@/scenes/GameScene'
import { GameOverScene } from '@/scenes/GameOverScene'
import { MenuScene } from '@/scenes/MenuScene'
import { PlayerPreviewScene } from '@/scenes/PlayerPreviewScene'

const container = document.getElementById('app')

if (container === null) {
  throw new Error('Missing #app container for Phaser bootstrap.')
}

document.title = GAME_TITLE

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: container,
  width: GAME_CONFIG.canvas.width,
  height: GAME_CONFIG.canvas.height,
  backgroundColor: '#111827',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: GAME_CONFIG.physics.gravityY,
      },
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, PlayerPreviewScene],
}

const game = new Phaser.Game(config)

if (import.meta.env.DEV) {
  ;(
    globalThis as typeof globalThis & {
      __zeroclawGame?: Phaser.Game
    }
  ).__zeroclawGame = game
}
