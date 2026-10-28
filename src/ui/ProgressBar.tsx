type ProgressBarProps = { value: number; max: number; showCount?: boolean }

export function ProgressBar({
  value,
  max,
  showCount = true,
}: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div className="progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      {showCount && (
        <span className="progress-count">
          {value} / {max}
        </span>
      )}
    </div>
  )
}
