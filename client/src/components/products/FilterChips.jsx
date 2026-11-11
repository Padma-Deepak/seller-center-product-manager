import Popover from '../ui/Popover'
import Icon from '../ui/Icons'
import { formatCount } from '../../utils/format'

export const UNPUBLISHED_OPTIONS = [
  ['salable', 'Salable Items'],
  ['not_for_sale', 'Not for Sale'],
  ['under_review', 'Under review'],
]
export const NOT_FOR_SALE_OPTIONS = [
  ['content', 'Content'],
  ['price', 'Price'],
  ['stock', 'Stock'],
  ['multimedia', 'Multimedia'],
  ['compliance', 'Compliance'],
  ['configuration', 'Configuration Seller Center'],
]

function Chip({ label, active, onClick, className = '' }) {
  return (
    <button className={`chip ${active ? 'active' : ''} ${className}`} onClick={onClick}>
      {label}
    </button>
  )
}

function DropdownChip({ defaultLabel, options, counts, view, filter, onSelect }) {
  const active = filter.view === view
  const selected = options.find(([v]) => v === filter.sub)
  const label = active && selected ? selected[1] : defaultLabel
  return (
    <Popover
      trigger={({ toggle }) => (
        <button className={`chip ${active ? 'active' : ''}`} onClick={toggle} aria-haspopup="listbox">
          {label}
          <Icon name="chevron" size={10} />
        </button>
      )}
    >
      {(close) => (
        <ul className="menu-list" role="listbox">
          {options.map(([value, text]) => (
            <li key={value}>
              <button
                onClick={() => {
                  onSelect({ view, sub: value })
                  close()
                }}
              >
                <span>{text}</span>
                <span className="pill">{formatCount(counts?.[value])}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  )
}

export default function FilterChips({ filter, counts, onChange }) {
  const is = (v) => filter.view === v
  return (
    <div className="chips">
      <Chip label="All" className="all" active={is('all')} onClick={() => onChange({ view: 'all', sub: null })} />
      <Chip label="Published" active={is('published')} onClick={() => onChange({ view: 'published', sub: null })} />
      <DropdownChip
        defaultLabel="Unpublished"
        view="unpublished"
        options={UNPUBLISHED_OPTIONS}
        counts={counts?.unpublished}
        filter={filter}
        onSelect={onChange}
      />
      <DropdownChip
        defaultLabel="Not for Sale"
        view="not_for_sale"
        options={NOT_FOR_SALE_OPTIONS}
        counts={counts?.notForSale}
        filter={filter}
        onSelect={onChange}
      />
      <Chip label="Drafts" active={is('drafts')} onClick={() => onChange({ view: 'drafts', sub: null })} />
      <Chip label="Deleted Products" active={is('deleted')} onClick={() => onChange({ view: 'deleted', sub: null })} />
    </div>
  )
}
