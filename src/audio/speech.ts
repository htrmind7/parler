const FRENCH_LANG = 'fr-FR'

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

/** Must be called from a user tap: mobile browsers block automatic playback. */
export function speakFrench(text: string, rate = 0.9): void {
  if (!isSpeechSupported()) return
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = FRENCH_LANG
  utterance.rate = rate
  const voice = pickFrenchVoice(synth.getVoices())
  if (voice) utterance.voice = voice
  synth.cancel()
  synth.speak(utterance)
}
