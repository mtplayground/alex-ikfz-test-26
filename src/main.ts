import './style.css'

import Phaser from 'phaser'

class MinimalScene extends Phaser.Scene {
  public constructor() {
    super('minimal-scene')
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#111827')

    this.add
      .text(400, 225, 'Phaser + Vite + TypeScript', {
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
      })
      .setOrigin(0.5)

    this.add
      .text(400, 270, 'Issue #1 bootstrap is running.', {
        color: '#94a3b8',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
      })
      .setOrigin(0.5)
  }
}

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
  scene: MinimalScene,
}

void new Phaser.Game(config)
