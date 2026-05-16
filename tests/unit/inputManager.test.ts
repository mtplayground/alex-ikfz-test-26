import { describe, expect, it } from 'vitest'

import { InputStateTracker } from '@/input/inputState'

function key(isDown = false): { isDown: boolean } {
  return { isDown }
}

describe('InputStateTracker', () => {
  it('reports held state for mapped actions', () => {
    const left = key()
    const jumpA = key()
    const jumpB = key()
    const tracker = new InputStateTracker({
      left: [left],
      jump: [jumpA, jumpB],
    })

    left.isDown = true
    jumpB.isDown = true
    tracker.update()

    expect(tracker.isDown('left')).toBe(true)
    expect(tracker.isDown('jump')).toBe(true)
  })

  it('reports justPressed only on the transition from up to down', () => {
    const confirm = key()
    const tracker = new InputStateTracker({
      confirm: [confirm],
    })

    tracker.update()
    expect(tracker.justPressed('confirm')).toBe(false)

    confirm.isDown = true
    tracker.update()
    expect(tracker.justPressed('confirm')).toBe(true)

    tracker.update()
    expect(tracker.justPressed('confirm')).toBe(false)
  })

  it('treats alternate bindings as one action', () => {
    const primaryJump = key()
    const alternateJump = key()
    const tracker = new InputStateTracker({
      jump: [primaryJump, alternateJump],
    })

    tracker.update()
    alternateJump.isDown = true
    tracker.update()

    expect(tracker.isDown('jump')).toBe(true)
    expect(tracker.justPressed('jump')).toBe(true)

    alternateJump.isDown = false
    primaryJump.isDown = true
    tracker.update()

    expect(tracker.isDown('jump')).toBe(true)
    expect(tracker.justPressed('jump')).toBe(false)
  })

  it('clears held and justPressed state after release', () => {
    const fireball = key(true)
    const tracker = new InputStateTracker({
      fireball: [fireball],
    })

    tracker.update()
    expect(tracker.isDown('fireball')).toBe(true)

    fireball.isDown = false
    tracker.update()

    expect(tracker.isDown('fireball')).toBe(false)
    expect(tracker.justPressed('fireball')).toBe(false)
  })
})
