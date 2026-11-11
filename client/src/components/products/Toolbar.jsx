import { useState } from 'react'
import Checkbox from '../ui/Checkbox'
import Icon from '../ui/Icons'

/** Bulk-action select + Go, catalog download and search box. */
export default function Toolbar({
  placeholder,
  bulkOptions,
  allSelected,
  someSelected,
  onToggleAll,
  onBulk,
  downloadHref,
  query,
  onQuery,
}) {
  const [action, setAction] = useState('')

  return (
    <div className="toolbar">
      <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} label="Select all" />
      <div className="select-wrap">
        <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">{placeholder}</option>
          {bulkOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <Icon name="chevron" size={12} className="select-chevron" />
      </div>
      <button
        className="go"
        disabled={!action || !someSelected && !allSelected}
        onClick={() => {
          onBulk(action)
          setAction('')
        }}
      >
        Go
      </button>
      <span className="sep" />
      <a className="dl" href={downloadHref} download>
        <Icon name="download" size={13} /> Download catalog
      </a>
      <span className="sep" />
      <div className="search">
        <span className="f"><Icon name="filter" size={12} /></span>
        <input placeholder="Search by name, SKU, or other criteria" value={query} onChange={(e) => onQuery(e.target.value)} />
        <span className="s"><Icon name="search" size={12} /></span>
      </div>
    </div>
  )
}
