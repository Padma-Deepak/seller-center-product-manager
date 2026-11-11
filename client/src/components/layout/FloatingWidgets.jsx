import Icon from '../ui/Icons'

export default function FloatingWidgets() {
  return (
    <>
      <button className="fab" aria-label="Notes"><Icon name="note" size={16} style={{ marginRight: 8 }} /></button>
      <div className="survey">
        <span>¿Recomendarías el proceso de...</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 3 11 9H1z" /></svg>
      </div>
    </>
  )
}
