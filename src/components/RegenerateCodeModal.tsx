import '../App.css'

interface RegenerateCodeModalProps {
  isSubmitting: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

function RegenerateCodeModal({ isSubmitting, error, onCancel, onConfirm }: RegenerateCodeModalProps) {
  return (
    <div className="modal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="regenerate-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="regenerate-title">Regenerate invite code?</h2>
        </div>
        <p className="modal-body-text">
          Anyone who has been given the current invite code and hasn't used it yet will find that it no longer works.
          They will need the newly generated code to join the squad. People who are already in the squad aren't affected.
        </p>
        {error && <p className="entry-error">{error}</p>}
        <div className="modal-actions">
          <div className="modal-actions-end">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegenerateCodeModal
