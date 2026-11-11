import { http, buildQuery } from './http'

export const listProducts = (params, signal) => http('/products', { params, signal })
export const getCounts = () => http('/products/counts')
export const setActive = (id, active) => http(`/products/${id}`, { method: 'PATCH', body: { active } })
export const deleteProduct = (id) => http(`/products/${id}`, { method: 'DELETE' })
export const restoreProduct = (id) => http(`/products/${id}/restore`, { method: 'POST' })
export const bulkAction = (action, ids) => http('/products/bulk', { method: 'POST', body: { action, ids } })
export const createDraft = () => http('/products', { method: 'POST', body: {} })
export const exportUrl = (params) => `/api/products/export${buildQuery(params)}`
export const getMe = () => http('/me')
