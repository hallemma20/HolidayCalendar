import '../App.css'

interface LeaveSquadModalProps {
  squadName: string
  isSubmitting: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

function LeaveSquadModal({ squadName, isSubmitting, error, onCancel, onConfirm }: LeaveSquadModalProps) {
  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="leave-title">Leave {squadName}?</h2>
        </div>
        <p className="modal-body-text">
          If you leave this squad, all of your events on its calendar will be deleted. You can rejoin the squad later
          with an invite code, but your events will not come back — you would need to create them again.
        </p>
        {error && <p className="entry-error">{error}</p>}
        <div className="modal-actions">
          <div className="modal-actions-end">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger-ghost" onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Leaving…' : 'Leave squad'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaveSquadModal
