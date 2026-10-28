import { useState } from 'react'
import { restrictToCards } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { isSpeechSupported, speakFrench } from '../audio/speech.ts'
import { directionForBox } from '../engine/config.ts'
import {
  answerInSession,
  gradeCard,
  isRetry,
  startSession,
} from '../engine/engine.ts'
import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'
import { CardDetails } from '../ui/CardTexts.tsx'
import { FlipCard } from '../ui/FlipCard.tsx'
import { SpeakerIcon } from '../ui/Icons.tsx'
import { ProgressBar } from '../ui/ProgressBar.tsx'

export function ReviewScreen({
  content,
  state,
  update,
  today,
  go,
}: ScreenProps) {
  const begin = () => startSession(restrictToCards(state, content.cards), today)
  const [session, setSession] = useState(begin)
  const [total, setTotal] = useState(session.queue.length)
  const [flipped, setFlipped] = useState(false)

  const cardId = session.queue[0]
  const card = content.cards.find((item) => item.id === cardId)
  const progress = cardId ? state.progress[cardId] : undefined

  if (total === 0) {
    return (
      <div className="screen centered">
        <p className="vi-main">{vi.review.nothing}</p>
        <Button onClick={() => go('home')}>{vi.review.backHome}</Button>
      </div>
    )
  }

  if (!card || !progress) {
    return (
      <div className="screen centered">
        <p className="vi-main">{vi.review.done}</p>
        <Button
          variant="outline"
          onClick={() => {
            const next = begin()
            setSession(next)
            setTotal(next.queue.length)
          }}
        >
          {vi.review.another}
        </Button>
        <Button onClick={() => go('home')}>{vi.review.backHome}</Button>
      </div>
    )
  }

  const direction = directionForBox(progress.box)
  const remaining = new Set(session.queue).size

  function answer(known: boolean) {
    if (!isRetry(session, card!.id)) {
      update((current) => gradeCard(current, card!.id, known, today))
    }
    setSession(answerInSession(session, known))
    setFlipped(false)
  }

  const front =
    direction === 'fr-to-vi' ? (
      <div className="card-face">
        <p className="muted">
          {isSpeechSupported() ? vi.review.listenPrompt : card.fr}
        </p>
        <Button
          variant="listen"
          icon={<SpeakerIcon size={22} />}
          onClick={() => speakFrench(card.fr)}
        >
          {vi.review.listen}
        </Button>
        <p className="hint">{vi.review.tapToFlip}</p>
      </div>
    ) : (
      <div className="card-face">
        <p className="vi-main big">{card.vi}</p>
        <p className="muted">{vi.review.sayPrompt}</p>
        <p className="hint">{vi.review.tapToFlip}</p>
      </div>
    )

  const back = (
    <div className="card-face">
      <p className="fr-word green">{card.fr}</p>
      <Button
        variant="listen"
        icon={<SpeakerIcon size={20} />}
        onClick={() => speakFrench(card.fr)}
      >
        {vi.review.listen}
      </Button>
      <CardDetails card={card} />
    </div>
  )

  return (
    <div className="screen">
      <ProgressBar value={total - remaining} max={total} />
      <FlipCard
        key={`${card.id}-${session.queue.length}`}
        front={front}
        back={back}
        flipped={flipped}
        phrase={card.type === 'phrase'}
        onFlip={() => setFlipped(true)}
        onSwipe={(direction) => answer(direction === 'right')}
      />
      <div className="answer-row">
        <Button
          variant="dontKnow"
          disabled={!flipped}
          onClick={() => answer(false)}
        >
          {vi.review.didntKnow}
        </Button>
        <Button variant="know" disabled={!flipped} onClick={() => answer(true)}>
          {vi.review.knew}
        </Button>
      </div>
    </div>
  )
}
