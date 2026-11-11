import * as service from '../services/products.service.js'
import { toCsv } from '../utils/csv.js'

export const list = (req, res) => res.json(service.listProducts(req.query))

export const counts = (req, res) => res.json(service.getCounts())

export const exportCsv = (req, res) => {
  const csv = toCsv(service.exportRows(req.query), [
    { header: 'ID', value: (p) => p.id },
    { header: 'Name', value: (p) => p.name },
    { header: 'SKU Seller', value: (p) => p.skuSeller },
    { header: 'SKU Falabella', value: (p) => p.skuFalabella },
    { header: 'Category', value: (p) => p.categoryPath },
    { header: 'Created', value: (p) => p.createdAt },
    { header: 'Price', value: (p) => p.price },
    { header: 'Offer Price', value: (p) => p.offerPrice },
    { header: 'Available Inventory', value: (p) => p.stock },
    { header: 'Active', value: (p) => p.active },
    { header: 'Status', value: (p) => p.status },
  ])
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="catalog.csv"')
  res.send(csv)
}

export const create = (req, res) => res.status(201).json(service.createDraft(req.body))

export const update = (req, res) => res.json(service.setActive(req.params.id, req.body?.active))

export const remove = (req, res) => res.json(service.softDelete(req.params.id))

export const restoreOne = (req, res) => res.json(service.restore(req.params.id))

export const bulkAction = (req, res) => res.json(service.bulk(req.body?.action, req.body?.ids))
