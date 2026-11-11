import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/ui/Icons'
import FilterChips from '../components/products/FilterChips'
import Toolbar from '../components/products/Toolbar'
import CatalogTable from '../components/products/CatalogTable'
import DraftsTable from '../components/products/DraftsTable'
import DeletedTable from '../components/products/DeletedTable'
import Pagination from '../components/products/Pagination'
import useDebounce from '../hooks/useDebounce'
import { useProducts, useCounts } from '../hooks/useProducts'
import * as api from '../api/products'

const TABS = ['Catalog', 'Pending', 'Stock']
const PAGE_SIZE = 20

export default function ProductManagerPage() {
  const [tab, setTab] = useState('Catalog')
  const [filter, setFilter] = useState({ view: 'all', sub: null })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())
  const [actionError, setActionError] = useState(null)

  const q = useDebounce(query, 300)
  const { view, sub } = filter
  const isDrafts = view === 'drafts'
  const isDeleted = view === 'deleted'

  // Drafts are shown newest-first by default.
  const effectiveSort = sort ?? (isDrafts ? { key: 'createdAt', dir: 'desc' } : null)

  const params = useMemo(
    () => ({ view, sub, q, sortBy: effectiveSort?.key, dir: effectiveSort?.dir, page, limit: PAGE_SIZE }),
    [view, sub, q, effectiveSort?.key, effectiveSort?.dir, page]
  )

  const { items, total, totalPages, loading, error, reload } = useProducts(params)
  const { counts, reloadCounts } = useCounts()

  // Reset paging / selection whenever the result set changes shape.
  useEffect(() => {
    setPage(1)
    setSelected(new Set())
  }, [view, sub, q])

  const changeFilter = (f) => {
    setFilter(f)
    setSort(null)
  }

  const onSort = (key) =>
    setSort((s) => {
      const cur = s ?? effectiveSort
      return cur?.key === key ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    })

  const refresh = () => {
    reload()
    reloadCounts()
  }

  const run = async (fn) => {
    try {
      setActionError(null)
      await fn()
      setSelected(new Set())
      refresh()
    } catch (e) {
      setActionError(e.message)
    }
  }

  const toggleOne = (id) =>
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const allSelected = items.length > 0 && items.every((r) => selected.has(r.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((r) => r.id)))

  const exportParams = { view, sub, q, sortBy: effectiveSort?.key, dir: effectiveSort?.dir }

  const catalogBulk = [['activate', 'Activate'], ['deactivate', 'Deactivate'], ['delete', 'Delete']]
  const deletedBulk = [['restore', 'Restore']]

  const addProduct = () =>
    run(async () => {
      await api.createDraft()
      changeFilter({ view: 'drafts', sub: null })
    })

  return (
    <main className="page">
      <h1>Product Manager</h1>

      <div className="tabs-row">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <button className="add-btn" onClick={addProduct}>
          <Icon name="plus" size={12} /> Add product
        </button>
      </div>

      {tab !== 'Catalog' ? (
        <div className="placeholder">The “{tab}” tab isn’t part of this mock yet.</div>
      ) : (
        <>
          <FilterChips filter={filter} counts={counts} onChange={changeFilter} />

          {!isDrafts && (
            <Toolbar
              placeholder={isDeleted ? 'Select Products' : 'Select an option'}
              bulkOptions={isDeleted ? deletedBulk : catalogBulk}
              allSelected={allSelected}
              someSelected={selected.size > 0}
              onToggleAll={toggleAll}
              onBulk={(action) => run(() => api.bulkAction(action, [...selected]))}
              downloadHref={api.exportUrl(exportParams)}
              query={query}
              onQuery={setQuery}
            />
          )}

          {(error || actionError) && <div className="error" role="alert">{error || actionError}</div>}

          <div className={`table-area ${loading ? 'loading' : ''}`}>
            {isDrafts ? (
              <DraftsTable rows={items} sort={effectiveSort} onSort={onSort} onDelete={(id) => run(() => api.deleteProduct(id))} />
            ) : isDeleted ? (
              <DeletedTable
                rows={items}
                selected={selected}
                onToggle={toggleOne}
                sort={effectiveSort}
                onSort={onSort}
                onRestore={(id) => run(() => api.restoreProduct(id))}
              />
            ) : (
              <CatalogTable
                rows={items}
                selected={selected}
                onToggle={toggleOne}
                sort={effectiveSort}
                onSort={onSort}
                onToggleActive={(id, v) => run(() => api.setActive(id, v))}
                onDelete={(id) => run(() => api.deleteProduct(id))}
              />
            )}
            {!loading && items.length === 0 && <div className="empty">No products found.</div>}
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} limit={PAGE_SIZE} onPage={setPage} />
        </>
      )}
    </main>
  )
}
