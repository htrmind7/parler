import { useState } from 'react'
import { restrictToCards } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { speakFrench } from '../audio/speech.ts'
import { introduceCard, nextNewCards } from '../engine/engine.ts'
import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'
import { CardDetails } from '../ui/CardTexts.tsx'
import { SpeakerIcon } from '../ui/Icons.tsx'
import { ProgressBar } from '../ui/ProgressBar.tsx'

export function LearnScreen({
  content,
  state,
  update,
  today,
  go,
}: ScreenProps) {
  const [queue] = useState(() =>
    nextNewCards(
      restrictToCards(state, content.cards),
      content.themes,
      content.cards,
      today,
    ),
  )
  const [index, setIndex] = useState(0)
  const card = queue[index]

  if (!card) {
    return (
      <div className="screen centered">
        <p className="vi-main">{vi.learn.done}</p>
        <Button onClick={() => go('home')}>{vi.learn.backHome}</Button>
      </div>
    )
  }

  function next() {
    update((current) => introduceCard(current, card.id, today))
    setIndex(index + 1)
  }

  return (
    <div className="screen">
      <ProgressBar value={index + 1} max={queue.length} />
      <div className={`learn-card ${card.type === 'phrase' ? 'phrase' : ''}`}>
        <p className="fr-word">{card.fr}</p>
        <Button
          variant="listen"
          icon={<SpeakerIcon size={20} />}
          onClick={() => speakFrench(card.fr)}
        >
          {vi.learn.listen}
        </Button>
      </div>
      <CardDetails card={card} />
      <Button variant="primary" onClick={next}>
        {vi.learn.next}
      </Button>
    </div>
  )
}
