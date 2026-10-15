// DEV-MOCK: temporary testing aid — see devMockData.ts for removal notes.

interface DevMockToolsProps {
  mockCount: number
  onAdd: () => void
  onClear: () => void
}

function DevMockTools({ mockCount, onAdd, onClear }: DevMockToolsProps) {
  return (
    <div className="dev-mock-tools" title="Temporary testing tool — client-side only, nothing is saved">
      <span className="dev-mock-label">DEV</span>
      <button type="button" className="btn btn-ghost" onClick={onAdd}>
        + Mock event from someone else
      </button>
      <button type="button" className="btn btn-ghost" onClick={onClear} disabled={mockCount === 0}>
        Clear mocks ({mockCount})
      </button>
    </div>
  )
}

export default DevMockTools
