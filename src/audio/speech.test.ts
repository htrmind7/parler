import { describe, expect, it } from 'vitest'
import { pickFrenchVoice, rankFrenchVoices } from './speech.ts'

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

  it('ranks a female enhanced voice above a male one', () => {
    const voices = [
      voice('Thomas', 'fr-FR'),
      voice('Amélie', 'fr-CA'),
      voice('Audrey (Enhanced)', 'fr-FR'),
    ]
    expect(rankFrenchVoices(voices).map((v) => v.name)).toEqual([
      'Audrey (Enhanced)',
      'Thomas',
      'Amélie',
    ])
  })

  it('honors the preferred voice when installed, else the best one', () => {
    const voices = [voice('Thomas', 'fr-FR'), voice('Audrey', 'fr-FR')]
    expect(pickFrenchVoice(voices, 'Thomas')?.name).toBe('Thomas')
    expect(pickFrenchVoice(voices, 'Gone')?.name).toBe('Audrey')
  })
})
