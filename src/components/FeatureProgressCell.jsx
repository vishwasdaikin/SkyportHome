/**
 * When editMode: 3-way control (None / Partial / Done). Otherwise empty cell.
 * @param {{ feature: string, status: 'done'|'partial'|null, setProgress: (feature: string, status: 'done'|'partial'|null) => void, editMode: boolean }} props
 */
export function FeatureProgressCell({ feature, status, setProgress, editMode }) {
  if (!editMode) {
    return <td className="features-cell-progress" aria-hidden />
  }

  return (
    <td className="features-cell-progress">
      <div className="features-progress-options" role="group" aria-label="Progress">
        <button
          type="button"
          className={`features-progress-btn features-progress-btn--none ${status === null ? 'active' : ''}`}
          onClick={() => setProgress(feature, null)}
          title="No status"
          aria-pressed={status === null}
        >
          —
        </button>
        <button
          type="button"
          className={`features-progress-btn features-progress-btn--partial ${status === 'partial' ? 'active' : ''}`}
          onClick={() => setProgress(feature, 'partial')}
          title="Partially done"
          aria-pressed={status === 'partial'}
        >
          Partial
        </button>
        <button
          type="button"
          className={`features-progress-btn features-progress-btn--done ${status === 'done' ? 'active' : ''}`}
          onClick={() => setProgress(feature, 'done')}
          title="Done"
          aria-pressed={status === 'done'}
        >
          Done
        </button>
      </div>
    </td>
  )
}
