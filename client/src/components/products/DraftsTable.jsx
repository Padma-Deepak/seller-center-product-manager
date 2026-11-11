import SortHeader from './SortHeader'
import RowMenu from './RowMenu'
import { formatDate } from '../../utils/format'

export default function DraftsTable({ rows, sort, onSort, onDelete }) {
  return (
    <div className="table">
      <div className="cols drafts thead">
        <div><SortHeader label="Product" sortKey="name" sort={sort} onSort={onSort} /></div>
        <div><SortHeader label="Category Path" sortKey="categoryPath" sort={sort} onSort={onSort} /></div>
        <div><SortHeader label="Creation date" sortKey="createdAt" sort={sort} onSort={onSort} /></div>
        <div>Actions</div>
      </div>
      {rows.map((p) => (
        <div className="cols drafts row slim" key={p.id}>
          <div className="c">{p.name}</div>
          <div className="c">{p.categoryPath}</div>
          <div className="c">{formatDate(p.createdAt)}</div>
          <div className="c"><RowMenu actions={[{ label: 'Delete', danger: true, onClick: () => onDelete(p.id) }]} /></div>
        </div>
      ))}
    </div>
  )
}
