import { useState } from 'react'
import { restrictToCards } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { speakFrench } from '../audio/speech.ts'
import {
  introduceCard,
  nextNewCards,
  remainingNewToday,
} from '../engine/engine.ts'
import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'
import { CardDetails } from '../ui/CardTexts.tsx'
import { CheckIcon, SpeakerIcon } from '../ui/Icons.tsx'
import { ProgressBar } from '../ui/ProgressBar.tsx'
import { THEME_TONES, ThemeIcon } from '../ui/ThemeIcon.tsx'

export function LearnScreen({
  content,
  state,
  update,
  today,
  go,
  learnThemeId,
}: ScreenProps) {
  const [queue] = useState(() =>
    nextNewCards(
      restrictToCards(state, content.cards),
      content.themes,
      content.cards,
      today,
      learnThemeId,
    ),
  )
  const [index, setIndex] = useState(0)
  const card = queue[index]

  if (!card) {
    const nothingToLearn = queue.length === 0
    const message = nothingToLearn
      ? remainingNewToday(state, today) === 0
        ? vi.learn.limitReached
        : vi.learn.themeEmpty
      : learnThemeId
        ? vi.learn.doneTheme
        : vi.learn.done
    return (
      <div className="screen centered">
        <span className="celebrate">
          <CheckIcon size={40} />
        </span>
        <p className="vi-main">{message}</p>
        <Button onClick={() => go('home')}>
          {learnThemeId ? vi.learn.anotherTheme : vi.learn.backHome}
        </Button>
      </div>
    )
  }

  const theme = content.themes.find((item) => item.id === card.themeId)

  function next() {
    update((current) => introduceCard(current, card.id, today))
    setIndex(index + 1)
  }

  return (
    <div className="screen" key={card.id}>
      <ProgressBar value={index + 1} max={queue.length} />
      <div
        className={`learn-card ${card.type === 'phrase' ? 'phrase' : ''}`}
        style={
          {
            '--tone': THEME_TONES[card.themeId] ?? 'var(--teal)',
          } as React.CSSProperties
        }
      >
        <div className="learn-tags">
          {theme && (
            <span className="chip chip-theme">
              <ThemeIcon themeId={theme.id} size={20} />
              {theme.titleVi}
            </span>
          )}
          {card.type === 'phrase' && (
            <span className="chip chip-phrase">{vi.learn.phraseBadge}</span>
          )}
        </div>
        <p className="fr-word">{card.fr}</p>
        <p className="translation">{card.vi}</p>
        <button
          type="button"
          className="listen-fab"
          aria-label={vi.learn.listen}
          onClick={() => speakFrench(card.fr)}
        >
          <SpeakerIcon size={26} />
        </button>
      </div>
      <CardDetails card={card} showTranslation={false} />
      <Button variant="primary" onClick={next}>
        {vi.learn.next}
      </Button>
    </div>
  )
}
