import Icon from '../ui/Icons'

export default function SortHeader({ label, sortKey, sort, onSort }) {
  const active = sort?.key === sortKey
  const icon = active ? (sort.dir === 'asc' ? 'arrowUp' : 'arrowDown') : 'sort'
  return (
    <button className={`sort-btn ${active ? 'active' : ''}`} onClick={() => onSort(sortKey)}>
      {label} <Icon name={icon} size={11} className="sort" />
    </button>
  )
}
