import { useRef, useState } from 'react'

const SWIPE_DISTANCE = 80
const TAP_DISTANCE = 8

type FlipCardProps = {
  front: React.ReactNode
  back: React.ReactNode
  flipped: boolean
  phrase?: boolean
  onFlip: () => void
  onSwipe: (direction: 'left' | 'right') => void
}

/** Tap to reveal the answer; once revealed, swipe right (knew it) or left (didn't know it). */
export function FlipCard({
  front,
  back,
  flipped,
  phrase,
  onFlip,
  onSwipe,
}: FlipCardProps) {
  const startX = useRef<number | null>(null)
  const [offset, setOffset] = useState(0)

  function onPointerDown(event: React.PointerEvent) {
    startX.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent) {
    if (startX.current === null || !flipped) return
    setOffset(event.clientX - startX.current)
  }

  function onPointerUp(event: React.PointerEvent) {
    if (startX.current === null) return
    const distance = event.clientX - startX.current
    startX.current = null
    setOffset(0)
    if (Math.abs(distance) < TAP_DISTANCE) {
      if (!flipped) onFlip()
    } else if (flipped && Math.abs(distance) >= SWIPE_DISTANCE) {
      onSwipe(distance > 0 ? 'right' : 'left')
    }
  }

  const classes = [
    'flip-card',
    flipped ? 'flip-card-back' : '',
    phrase ? 'flip-card-phrase' : '',
  ].join(' ')

  return (
    <div
      className={classes}
      style={{ transform: `translateX(${offset}px) rotate(${offset / 40}deg)` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        startX.current = null
        setOffset(0)
      }}
    >
      {flipped ? back : front}
    </div>
  )
}
