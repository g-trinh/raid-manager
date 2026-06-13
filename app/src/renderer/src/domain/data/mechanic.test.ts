import { describe, expect, it } from 'vitest'
import { BossMechanicData, createMechanic, MechanicType } from './mechanic'

// AC (BM-01): createMechanic applies per-type defaults; overrides win.
describe('createMechanic — per-type defaults', () => {
  const cases: [MechanicType, Omit<BossMechanicData, 'name'>][] = [
    [MechanicType.TANKBUSTER, { type: MechanicType.TANKBUSTER, tested: 'skill', targets: 'TANKS', severity: 3 }],
    [MechanicType.RAIDWIDE, { type: MechanicType.RAIDWIDE, tested: 'discipline', targets: 'ALL', severity: 2 }],
    [MechanicType.SPREAD, { type: MechanicType.SPREAD, tested: 'discipline', targets: 'ALL', severity: 2 }],
    [MechanicType.STACK, { type: MechanicType.STACK, tested: 'discipline', targets: 'ALL', severity: 2 }],
    [MechanicType.SOAK, { type: MechanicType.SOAK, tested: 'discipline', targets: 'DPS', severity: 2 }],
    [MechanicType.ADD_WAVE, { type: MechanicType.ADD_WAVE, tested: 'skill', targets: 'DPS', severity: 1 }],
    [MechanicType.DODGE, { type: MechanicType.DODGE, tested: 'skill', targets: 'ALL', severity: 1 }]
  ]

  it.each(cases)('%s yields its default profile', (type, expected) => {
    expect(createMechanic(type, 'Test Mechanic')).toEqual({ name: 'Test Mechanic', ...expected })
  })

  it('matches the ADR-002 worked example for TANKBUSTER', () => {
    expect(createMechanic(MechanicType.TANKBUSTER, 'X')).toEqual({
      type: MechanicType.TANKBUSTER,
      name: 'X',
      tested: 'skill',
      targets: 'TANKS',
      severity: 3
    })
  })
})

// AC (BM-01): overrides win over defaults; type and name are never overridable.
describe('createMechanic — overrides', () => {
  it('an override replaces the corresponding default', () => {
    const m = createMechanic(MechanicType.TANKBUSTER, 'Brand of Iron', { tested: 'discipline' })
    expect(m.tested).toBe('discipline')
    // Untouched defaults survive
    expect(m.targets).toBe('TANKS')
    expect(m.severity).toBe(3)
  })

  it('multiple overrides all win', () => {
    const m = createMechanic(MechanicType.DODGE, 'Sweeping Cleave', {
      targets: 'DPS',
      severity: 2
    })
    expect(m.targets).toBe('DPS')
    expect(m.severity).toBe(2)
    expect(m.tested).toBe('skill') // default kept
  })

  it('type and name are not overridable via the overrides bag', () => {
    // @ts-expect-error type is excluded from the overrides type
    const m = createMechanic(MechanicType.SOAK, 'Blight Pool', { type: MechanicType.TANKBUSTER })
    expect(m.type).toBe(MechanicType.SOAK)
    expect(m.name).toBe('Blight Pool')
  })
})
