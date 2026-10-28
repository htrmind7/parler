import { restrictToCards, themeProgress } from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { dueCards, nextNewCards, remainingNewToday } from '../engine/engine.ts'
import { format } from '../i18n/format.ts'
import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'
import { ProgressBar } from '../ui/ProgressBar.tsx'

export function HomeScreen({ content, state, today, go }: ScreenProps) {
  const active = restrictToCards(state, content.cards)
  const newCards = nextNewCards(active, content.themes, content.cards, today)
  const dueCount = dueCards(active, today).length
  const limitReached = remainingNewToday(state, today) === 0

  return (
    <div className="screen">
      <h1 className="app-name small">{vi.app.name}</h1>

      <div className="actions">
        <Button disabled={newCards.length === 0} onClick={() => go('learn')}>
          {vi.home.learnNew}
        </Button>
        <p className="muted">
          {newCards.length > 0
            ? format(vi.home.learnNewCount, { n: newCards.length })
            : limitReached
              ? vi.home.limitReached
              : vi.home.nothingNew}
        </p>

        <Button
          variant="outline"
          disabled={dueCount === 0}
          onClick={() => go('review')}
        >
          {vi.home.review}
        </Button>
        <p className="muted">
          {dueCount > 0
            ? format(vi.home.reviewDue, { n: dueCount })
            : vi.home.nothingDue}
        </p>
      </div>

      <h2 className="section-title">{vi.home.themes}</h2>
      <ul className="list">
        {themeProgress(state, content.themes, content.cards).map(
          ({ theme, done, total }) => (
            <li key={theme.id} className="list-row column">
              <div className="row-between">
                <span>{theme.titleVi}</span>
                <span className="muted">
                  {format(vi.home.themeProgress, { done, total })}
                </span>
              </div>
              <ProgressBar value={done} max={total} showCount={false} />
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
