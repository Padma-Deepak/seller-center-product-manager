import Checkbox from '../ui/Checkbox'
import SortHeader from './SortHeader'
import RowMenu from './RowMenu'
import { formatDate } from '../../utils/format'

export default function DeletedTable({ rows, selected, onToggle, sort, onSort, onRestore }) {
  return (
    <div className="table">
      <div className="cols deleted thead">
        <div />
        <div><SortHeader label="Product" sortKey="name" sort={sort} onSort={onSort} /></div>
        <div>Creation</div>
        <div>Updated</div>
        <div>Actions</div>
      </div>
      {rows.map((p) => (
        <div className="cols deleted row muted" key={p.id}>
          <div className="c"><Checkbox checked={selected.has(p.id)} onChange={() => onToggle(p.id)} label={`Select ${p.name}`} /></div>
          <div className="c">
            <div className="pname">{p.name}</div>
            <div className="sku"><b>SKU Seller</b>{p.skuSeller}</div>
            <div className="sku"><b>SKU Falabella</b>{p.skuFalabella}</div>
          </div>
          <div className="c">{formatDate(p.createdAt)}</div>
          <div className="c">{formatDate(p.updatedAt)}</div>
          <div className="c"><RowMenu actions={[{ label: 'Restore', onClick: () => onRestore(p.id) }]} /></div>
        </div>
      ))}
    </div>
  )
}
