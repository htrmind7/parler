import {
  currentStreak,
  restrictToCards,
  themeProgress,
} from '../app/selectors.ts'
import type { ScreenProps } from '../app/types.ts'
import { dueCards, nextNewCards, remainingNewToday } from '../engine/engine.ts'
import { format } from '../i18n/format.ts'
import vi from '../i18n/vi.json'
import { Button } from '../ui/Button.tsx'
import { CheckIcon, FlameIcon, LockIcon, ReviewIcon } from '../ui/Icons.tsx'
import { ProgressBar } from '../ui/ProgressBar.tsx'
import { ProgressRing } from '../ui/ProgressRing.tsx'
import { THEME_TONES, ThemeIcon } from '../ui/ThemeIcon.tsx'

export function HomeScreen({
  content,
  state,
  today,
  go,
  startLearning,
}: ScreenProps) {
  const active = restrictToCards(state, content.cards)
  const newCards = nextNewCards(active, content.themes, content.cards, today)
  const dueCount = dueCards(active, today).length
  const remaining = remainingNewToday(state, today)
  const goal = state.settings.newPerDay
  const doneToday = goal - remaining
  const streak = currentStreak(state.activity, today)

  return (
    <div className="screen">
      <header className="topbar">
        <h1 className="wordmark">{vi.app.name}</h1>
        {streak > 0 && (
          <span className="chip chip-streak">
            <FlameIcon size={18} />
            {format(vi.home.streak, { n: streak })}
          </span>
        )}
      </header>

      <section className="hero">
        <div className="hero-top">
          <ProgressRing value={doneToday} max={goal} />
          <div>
            <h2 className="hero-title">{vi.home.goalTitle}</h2>
            <p className="muted">
              {remaining === 0
                ? vi.home.goalDone
                : format(vi.home.goalProgress, {
                    done: doneToday,
                    total: goal,
                  })}
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Button
            disabled={newCards.length === 0}
            onClick={() => startLearning()}
          >
            {vi.home.learnNew}
          </Button>
          <Button
            variant="soft"
            disabled={dueCount === 0}
            icon={<ReviewIcon size={20} />}
            onClick={() => go('review')}
          >
            {vi.home.review}
            {dueCount > 0 && <span className="badge">{dueCount}</span>}
          </Button>
        </div>
        <p className="muted hero-note">
          {dueCount > 0
            ? format(vi.home.reviewDue, { n: dueCount })
            : vi.home.nothingDue}
        </p>
      </section>

      <h2 className="section-title">{vi.home.chooseTheme}</h2>
      <ul className="theme-grid">
        {themeProgress(state, content.themes, content.cards).map(
          ({ theme, done, total }) => {
            const available = nextNewCards(
              active,
              content.themes,
              content.cards,
              today,
              theme.id,
            ).length
            const complete = done === total
            const status = complete
              ? vi.home.themeDone
              : available > 0
                ? null
                : remaining === 0
                  ? vi.home.themeTomorrow
                  : vi.home.themeReviewFirst
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  className="theme-card"
                  disabled={available === 0}
                  style={
                    {
                      '--tone': THEME_TONES[theme.id] ?? 'var(--teal)',
                    } as React.CSSProperties
                  }
                  onClick={() => startLearning(theme.id)}
                >
                  <span className="theme-tile">
                    <ThemeIcon themeId={theme.id} size={34} />
                    {complete && (
                      <span className="theme-check">
                        <CheckIcon size={12} />
                      </span>
                    )}
                    {!complete && available === 0 && (
                      <span className="theme-check theme-lock">
                        <LockIcon size={12} />
                      </span>
                    )}
                  </span>
                  <span className="theme-name">{theme.titleVi}</span>
                  <span className="theme-meta">
                    {format(vi.home.themeProgress, { done, total })}
                    {status && ` · ${status}`}
                  </span>
                  <ProgressBar value={done} max={total} showCount={false} />
                </button>
              </li>
            )
          },
        )}
      </ul>
    </div>
  )
}
