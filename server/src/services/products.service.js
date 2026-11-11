import { products, makeProduct } from '../data/products.mock.js'
import { config } from '../config/index.js'
import { badRequest, notFoundError } from '../utils/httpError.js'

export const VIEWS = ['all', 'published', 'unpublished', 'not_for_sale', 'drafts', 'deleted']
export const UNPUBLISHED_SUBS = ['salable', 'not_for_sale', 'under_review']
export const NOT_FOR_SALE_SUBS = ['content', 'price', 'stock', 'multimedia', 'compliance', 'configuration']
export const SORT_KEYS = ['name', 'createdAt', 'updatedAt', 'price', 'offerPrice', 'categoryPath']
export const BULK_ACTIONS = ['activate', 'deactivate', 'delete', 'restore']

const inCatalog = (p) => p.status === 'published' || p.status === 'unpublished'

function matchesView(p, view, sub) {
  switch (view) {
    case 'all':
      return inCatalog(p)
    case 'published':
      return p.status === 'published'
    case 'unpublished':
      return p.status === 'unpublished' && (!sub || p.unpublishedReason === sub)
    case 'not_for_sale':
      return p.status === 'unpublished' && p.unpublishedReason === 'not_for_sale' && (!sub || p.notForSaleReason === sub)
    case 'drafts':
      return p.status === 'draft'
    case 'deleted':
      return p.status === 'deleted'
    default:
      return false
  }
}

function validateFilter({ view = 'all', sub }) {
  if (!VIEWS.includes(view)) throw badRequest(`Invalid view "${view}". Use one of: ${VIEWS.join(', ')}`)
  if (sub) {
    const allowed = view === 'unpublished' ? UNPUBLISHED_SUBS : view === 'not_for_sale' ? NOT_FOR_SALE_SUBS : []
    if (!allowed.includes(sub)) throw badRequest(`Invalid sub filter "${sub}" for view "${view}"`)
  }
}

function compare(a, b, key, dir) {
  const av = a[key]
  const bv = b[key]
  if (av == null && bv == null) return 0
  if (av == null) return 1 // nulls always last
  if (bv == null) return -1
  const result = typeof av === 'string' ? av.localeCompare(bv, 'es', { sensitivity: 'base' }) : av - bv
  return dir === 'asc' ? result : -result
}

function filtered({ view = 'all', sub, q, sortBy = 'createdAt', dir = 'desc' }) {
  validateFilter({ view, sub })
  if (!SORT_KEYS.includes(sortBy)) throw badRequest(`Invalid sortBy "${sortBy}"`)
  if (!['asc', 'desc'].includes(dir)) throw badRequest('dir must be "asc" or "desc"')

  const needle = q?.trim().toLowerCase()
  return products
    .filter((p) => matchesView(p, view, sub))
    .filter((p) => !needle || [p.name, p.skuSeller, p.skuFalabella, p.categoryPath].some((s) => s?.toLowerCase().includes(needle)))
    .sort((a, b) => compare(a, b, sortBy, dir) || b.id - a.id)
}

export function listProducts(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(config.maxPageSize, Math.max(1, parseInt(query.limit, 10) || config.defaultPageSize))
  const rows = filtered(query)
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return { items: rows.slice((page - 1) * limit, page * limit), total, page, limit, totalPages }
}

export function exportRows(query) {
  return filtered(query)
}

export function getCounts() {
  const count = (view, sub) => products.filter((p) => matchesView(p, view, sub)).length
  return {
    all: count('all'),
    published: count('published'),
    unpublished: Object.fromEntries(UNPUBLISHED_SUBS.map((s) => [s, count('unpublished', s)])),
    notForSale: Object.fromEntries(NOT_FOR_SALE_SUBS.map((s) => [s, count('not_for_sale', s)])),
    drafts: count('drafts'),
    deleted: count('deleted'),
  }
}

const findOrThrow = (id) => {
  const p = products.find((x) => x.id === Number(id))
  if (!p) throw notFoundError(`Product ${id} not found`)
  return p
}

const touch = (p) => {
  p.updatedAt = new Date().toISOString()
  return p
}

export function setActive(id, active) {
  if (typeof active !== 'boolean') throw badRequest('"active" must be a boolean')
  const p = findOrThrow(id)
  if (!inCatalog(p)) throw badRequest('Only catalog products can be activated or deactivated')
  p.active = active
  return touch(p)
}

export function softDelete(id) {
  const p = findOrThrow(id)
  if (p.status === 'deleted') return p
  p.previousStatus = p.status
  p.status = 'deleted'
  p.active = false
  return touch(p)
}

export function restore(id) {
  const p = findOrThrow(id)
  if (p.status !== 'deleted') throw badRequest('Product is not deleted')
  p.status = p.previousStatus || 'draft'
  p.previousStatus = null
  return touch(p)
}

export function bulk(action, ids) {
  if (!BULK_ACTIONS.includes(action)) throw badRequest(`Invalid action "${action}". Use one of: ${BULK_ACTIONS.join(', ')}`)
  if (!Array.isArray(ids) || ids.length === 0) throw badRequest('"ids" must be a non-empty array')
  const run = { activate: (id) => setActive(id, true), deactivate: (id) => setActive(id, false), delete: softDelete, restore }[action]
  let affected = 0
  for (const id of ids) {
    try {
      run(id)
      affected++
    } catch {
      /* skip items the action doesn't apply to */
    }
  }
  return { affected }
}

export function createDraft({ name, categoryPath } = {}) {
  const now = new Date()
  const stamp = now.toISOString().slice(0, 19).replace('T', ' ')
  const p = makeProduct({
    name: name?.trim() || `Untitled Draft (${stamp})`,
    categoryPath: categoryPath || '',
    status: 'draft',
    createdAt: now.toISOString(),
  })
  products.push(p)
  return p
}
