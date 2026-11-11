import Checkbox from '../ui/Checkbox'
import Toggle from '../ui/Toggle'
import Icon from '../ui/Icons'
import SortHeader from './SortHeader'
import RowMenu from './RowMenu'
import { formatDate, formatPrice } from '../../utils/format'

export default function CatalogTable({ rows, selected, onToggle, sort, onSort, onToggleActive, onDelete }) {
  return (
    <div className="table">
      <div className="cols catalog thead">
        <div />
        <div><SortHeader label="Product" sortKey="name" sort={sort} onSort={onSort} /></div>
        <div><SortHeader label="Creation" sortKey="createdAt" sort={sort} onSort={onSort} /></div>
        <div><SortHeader label="Price" sortKey="price" sort={sort} onSort={onSort} /></div>
        <div><SortHeader label="Offer Price" sortKey="offerPrice" sort={sort} onSort={onSort} /></div>
        <div>Recommendations</div>
        <div className="inv">Available<br />Inventory</div>
        <div className="pad-l">Active</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {rows.map((p) => (
        <div className="cols catalog row" key={p.id}>
          <div className="c"><Checkbox checked={selected.has(p.id)} onChange={() => onToggle(p.id)} label={`Select ${p.name}`} /></div>
          <div className="c">
            <div className="pname">{p.name}</div>
            <div className="sku"><b>SKU Seller</b>{p.skuSeller}</div>
            <div className="sku"><b>SKU Falabella</b>{p.skuFalabella}</div>
          </div>
          <div className="c">{formatDate(p.createdAt)}</div>
          <div className="c price">{formatPrice(p.price)}</div>
          <div className="c price">{formatPrice(p.offerPrice)}</div>
          <div className="c reco">{p.recommendations.map((r) => <div key={r}>{r}</div>)}</div>
          <div className="c inv-v">{p.stock}</div>
          <div className="c pad-l"><Toggle checked={p.active} onChange={(v) => onToggleActive(p.id, v)} /></div>
          <div className="c status">
            {p.status === 'published'
              ? <Icon name="checkCircle" size={14} className="ok" />
              : <Icon name="xCircle" size={14} className="bad" />}
          </div>
          <div className="c"><RowMenu actions={[{ label: 'Delete', danger: true, onClick: () => onDelete(p.id) }]} /></div>
        </div>
      ))}
    </div>
  )
}
