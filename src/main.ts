import './style.css'

import Phaser from 'phaser'
import { BootScene } from '@/scenes/BootScene'

const container = document.getElementById('app')

if (container === null) {
  throw new Error('Missing #app container for Phaser bootstrap.')
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: container,
  width: 800,
  height: 450,
  backgroundColor: '#111827',
  scene: [BootScene],
}

void new Phaser.Game(config)
