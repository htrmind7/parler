const FRENCH_LANG = 'fr-FR'

export type SpeechProblem = 'no-french-voice' | 'failed'

type Listener = (problem: SpeechProblem | null) => void

const listeners = new Set<Listener>()

/** Lets the interface show why nothing was heard (no voice installed, blocked playback...). */
export function onSpeechProblem(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function report(problem: SpeechProblem | null): void {
  listeners.forEach((listener) => listener(problem))
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Per-device choice, kept apart from the exported progress. */
export const VOICE_KEY = 'parler.voice'

// The Web Speech API exposes no gender: known voice names are the only hint.
const FEMALE_NAMES =
  /audrey|aurélie|aurelie|marie|julie|hortense|denise|céline|celine|eloise|éloïse|vivienne|google français|siri.*voix 1/i
const MALE_NAMES = /thomas|daniel|paul|henri|claude|antoine|nicolas|jean/i

function langOf(voice: SpeechSynthesisVoice): string {
  return voice.lang.replace('_', '-').toLowerCase()
}

export function isFrenchVoice(voice: SpeechSynthesisVoice): boolean {
  return langOf(voice).startsWith('fr')
}

function voiceScore(voice: SpeechSynthesisVoice): number {
  let score = 0
  if (langOf(voice) === 'fr-fr') score += 100
  if (/premium|enhanced|améliorée|ameliorée|natural|neural/i.test(voice.name))
    score += 30
  if (FEMALE_NAMES.test(voice.name)) score += 20
  if (MALE_NAMES.test(voice.name)) score -= 20
  return score
}

/** French voices, best first: fr-FR, high quality, then female-sounding names. */
export function rankFrenchVoices(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice[] {
  return voices
    .filter(isFrenchVoice)
    .map((voice, index) => ({ voice, index, score: voiceScore(voice) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.voice)
}

export function loadVoiceName(): string | null {
  try {
    return localStorage.getItem(VOICE_KEY)
  } catch {
    return null
  }
}

export function saveVoiceName(name: string | null): void {
  try {
    if (name) localStorage.setItem(VOICE_KEY, name)
    else localStorage.removeItem(VOICE_KEY)
  } catch {
    // blocked storage: the automatic choice still works
  }
}

/** The voice picked in Settings if it is still installed, else the best ranked one. */
export function pickFrenchVoice(
  voices: readonly SpeechSynthesisVoice[],
  preferredName: string | null = null,
): SpeechSynthesisVoice | undefined {
  const ranked = rankFrenchVoices(voices)
  return ranked.find((voice) => voice.name === preferredName) ?? ranked[0]
}

export function getFrenchVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return []
  return rankFrenchVoices(window.speechSynthesis.getVoices())
}

/** Browsers load their voices lazily: ask early so the first tap already finds them. */
export function primeVoices(): void {
  if (!isSpeechSupported()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  })
}

/**
 * Must be called synchronously from a user tap: mobile browsers block automatic
 * playback, and iOS refuses speech started after an await.
 */
export function speakFrench(text: string, rate = 0.9): void {
  if (!isSpeechSupported()) return
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = FRENCH_LANG
  utterance.rate = rate

  const voices = synth.getVoices()
  const voice = pickFrenchVoice(voices, loadVoiceName())
  if (voice) utterance.voice = voice
  // No voice at all can simply mean the list is not loaded yet: only report a real gap
  if (!voice && voices.length > 0) report('no-french-voice')

  utterance.onstart = () => report(null)
  utterance.onerror = (event) => {
    // "canceled" and "interrupted" come from our own cancel() before a new utterance
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      report('failed')
    }
  }

  // Calling cancel() when nothing is playing can swallow the next utterance in Chromium
  if (synth.speaking || synth.pending) synth.cancel()
  synth.speak(utterance)
}
