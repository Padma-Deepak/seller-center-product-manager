export default function Pagination({ page, totalPages, total, limit, onPage }) {
  if (total === 0) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(total, page * limit)
  return (
    <div className="pager">
      <span>{from}–{to} of {total}</span>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  )
}
