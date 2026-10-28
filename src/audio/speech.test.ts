import { describe, expect, it } from 'vitest'
import { pickFrenchVoice } from './speech.ts'

const voice = (name: string, lang: string) =>
  ({ name, lang }) as SpeechSynthesisVoice

describe('pickFrenchVoice', () => {
  it('prefers fr-FR over other French voices', () => {
    const voices = [
      voice('en', 'en-US'),
      voice('ca', 'fr-CA'),
      voice('fr', 'fr-FR'),
    ]
    expect(pickFrenchVoice(voices)?.name).toBe('fr')
  })

  it('accepts the underscore form used by some Android browsers', () => {
    expect(pickFrenchVoice([voice('fr', 'fr_FR')])?.name).toBe('fr')
  })

  it('falls back to any French voice', () => {
    expect(pickFrenchVoice([voice('be', 'fr-BE')])?.name).toBe('be')
  })

  it('returns undefined without a French voice', () => {
    expect(pickFrenchVoice([voice('en', 'en-US')])).toBeUndefined()
  })
})
