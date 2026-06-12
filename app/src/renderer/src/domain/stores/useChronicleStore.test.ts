import { beforeEach, describe, expect, it } from 'vitest'
import { useChronicleStore } from './useChronicleStore'

beforeEach(() => {
  useChronicleStore.getState().reset()
})

// AC: every system event lands in the chronicle as a readable entry (player-feedback spec)
describe('chronicle — logging', () => {
  it('appends entries in order with unique ids', () => {
    useChronicleStore.getState().log('loot', 'first')
    useChronicleStore.getState().log('battle', 'second')
    const entries = useChronicleStore.getState().entries
    expect(entries.map((e) => e.text)).toEqual(['first', 'second'])
    expect(entries.map((e) => e.kind)).toEqual(['loot', 'battle'])
    expect(entries[0].id).not.toBe(entries[1].id)
  })

  it('reset clears all entries', () => {
    useChronicleStore.getState().log('camp', 'something')
    useChronicleStore.getState().reset()
    expect(useChronicleStore.getState().entries).toEqual([])
  })
})
