import Icon from '../ui/Icons'

const items = ['grid', 'bag', 'truck', 'chart', 'rocket', 'card', 'userCircle', 'headset', 'gear', 'key']

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <button className="menu" aria-label="Menu"><Icon name="menu" size={16} /></button>
      {items.map((n) => (
        <button key={n} className={`nav-item ${n === 'bag' ? 'current' : ''}`} aria-label={n}>
          <Icon name={n} size={16} />
        </button>
      ))}
    </nav>
  )
}
