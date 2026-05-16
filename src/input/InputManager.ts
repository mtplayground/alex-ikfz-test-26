import Phaser from 'phaser'
import { InputStateTracker, type InputBindings } from '@/input/inputState'

export type InputAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'run'
  | 'jump'
  | 'fireball'
  | 'confirm'

function bindKeys(
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null | undefined,
  keyCodes: readonly number[],
): Array<{ isDown: boolean }> {
  return keyCodes.map(
    (keyCode) =>
      keyboard?.addKey(keyCode) ?? {
        isDown: false,
      },
  )
}

function createDefaultBindings(
  scene: Phaser.Scene,
): InputBindings<InputAction> {
  const keyboard = scene.input.keyboard

  return {
    left: bindKeys(keyboard, [
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.A,
    ]),
    right: bindKeys(keyboard, [
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.D,
    ]),
    up: bindKeys(keyboard, [Phaser.Input.Keyboard.KeyCodes.UP]),
    down: bindKeys(keyboard, [Phaser.Input.Keyboard.KeyCodes.DOWN]),
    run: bindKeys(keyboard, [Phaser.Input.Keyboard.KeyCodes.SHIFT]),
    jump: bindKeys(keyboard, [
      Phaser.Input.Keyboard.KeyCodes.Z,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]),
    fireball: bindKeys(keyboard, [Phaser.Input.Keyboard.KeyCodes.X]),
    confirm: bindKeys(keyboard, [Phaser.Input.Keyboard.KeyCodes.ENTER]),
  }
}

export class InputManager extends InputStateTracker<InputAction> {
  public constructor(scene: Phaser.Scene) {
    super(createDefaultBindings(scene))
  }
}
