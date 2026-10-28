import { describe, expect, it } from 'vitest'
import vi from './i18n/vi.json'

describe('vi.json', () => {
  it('defines the app name', () => {
    expect(vi.app.name).not.toBe('')
  })
})
