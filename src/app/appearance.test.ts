import { describe, expect, it } from 'vitest'
import { defaultAppearance, parseAppearance } from './appearance.ts'

describe('appearance', () => {
  it('accepts only the known appearances', () => {
    expect(parseAppearance('mint')).toBe('mint')
    expect(parseAppearance('light')).toBe('light')
    expect(parseAppearance('dark')).toBe('dark')
    expect(parseAppearance('pink')).toBeNull()
    expect(parseAppearance(null)).toBeNull()
  })

  it('follows the system preference by default', () => {
    expect(defaultAppearance(true)).toBe('dark')
    expect(defaultAppearance(false)).toBe('light')
  })
})
