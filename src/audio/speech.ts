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

/** Prefers a fr-FR voice, then any French voice. */
export function pickFrenchVoice(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const lang = (voice: SpeechSynthesisVoice) => voice.lang.replace('_', '-')
  return (
    voices.find((voice) => lang(voice).toLowerCase() === 'fr-fr') ??
    voices.find((voice) => lang(voice).toLowerCase().startsWith('fr'))
  )
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
  const voice = pickFrenchVoice(voices)
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
