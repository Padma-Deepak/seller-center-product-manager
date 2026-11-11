/**
 * In-memory mock data for the Product Manager.
 *
 * Product shape
 *  status:            'published' | 'unpublished' | 'draft' | 'deleted'
 *  unpublishedReason: 'salable' | 'not_for_sale' | 'under_review'   (status === 'unpublished')
 *  notForSaleReason:  'content' | 'price' | 'stock' | 'multimedia' | 'compliance' | 'configuration'
 *                     (unpublishedReason === 'not_for_sale')
 *  previousStatus:    set when a product is soft-deleted so it can be restored
 */

let nextId = 1

const make = (p) => ({
  id: nextId++,
  name: '',
  skuSeller: '',
  skuFalabella: '',
  categoryPath: '',
  price: 0,
  offerPrice: null,
  stock: 0,
  active: false,
  status: 'unpublished',
  unpublishedReason: null,
  notForSaleReason: null,
  recommendations: [],
  previousStatus: null,
  createdAt: null,
  updatedAt: null,
  ...p,
})

const SHIRTS = 'Clothes and accessories > Clothing > Upper body clothing > Shirts | blouses | polos | t-shirts'
const CABINETS = 'Storage > Tool storage > Cabinets | Tool Cabinets'
const SHOES = 'Footwear > General purpose footwear > Heeled | platform shoes'
const SCULPT = 'Arts, Crafts and Sewing > Arts and Crafts > Tools for non-electric sculptors'
const LAPTOPS = 'Electronics > computing > Computers > Laptops | notebooks'

/* ---------- Catalog: the products visible in the reference screenshots ---------- */

const testBase = 'This is a test product do not buy 001 nov 2 7.58pm 2526029954'
const notForSaleContent = { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'content' }

const handCrafted = [
  { name: `${testBase} / Índigo / XS`, skuSeller: '202611111700', skuFalabella: '101355761', price: 123, stock: 2000, createdAt: '2026-11-11T19:58:00Z' },
  { name: `${testBase} / Índigo / XXL`, skuSeller: '202611111701', skuFalabella: '101355760', price: 123, stock: 1000, createdAt: '2026-11-11T19:57:00Z' },
  { name: `${testBase} / Índigo / XS`, skuSeller: '202611111602', skuFalabella: '101355759', price: 123, stock: 2000, createdAt: '2026-11-11T19:56:00Z' },
  { name: 'Test product stock update 5 / Amarillo / M', skuSeller: '202611111201', skuFalabella: '101355744', price: 500, stock: 1000, createdAt: '2026-11-11T12:01:00Z' },
  { name: 'Test product stock update 5 / Amarillo / L', skuSeller: '202611111202', skuFalabella: '101355743', price: 500, stock: 2000, createdAt: '2026-11-11T12:02:00Z' },
  { name: 'Test product stock update 5 / Amarillo / L', skuSeller: '202611111211', skuFalabella: '101355749', price: 500, stock: 3000, createdAt: '2026-11-11T12:11:00Z' },
].map((p) => make({ ...notForSaleContent, categoryPath: SHIRTS, ...p }))

/* ---------- Catalog: generated products across all states ---------- */

const families = [
  { name: 'Polera Básica Algodón', category: SHIRTS, price: 9990, colors: ['Blanco', 'Negro'], sizes: ['S', 'M', 'L'] },
  { name: 'Zapatilla Urbana Running', category: 'Footwear > Sports footwear > Running shoes', price: 39990, colors: ['Gris', 'Azul'], sizes: ['38', '40', '42'] },
  { name: 'Notebook HP Pavilion 15', category: LAPTOPS, price: 549990, colors: ['Plata'], sizes: ['8GB', '16GB', '32GB'] },
  { name: 'Mochila Outdoor 30L', category: 'Sports > Camping > Backpacks', price: 24990, colors: ['Verde', 'Negro'], sizes: ['Única'] },
  { name: 'Audífonos Bluetooth Pro', category: 'Electronics > Audio > Headphones', price: 29990, colors: ['Negro', 'Blanco'], sizes: ['Única'] },
]

// Cycle of states so every filter chip has data.
const states = [
  { status: 'published', active: true },
  { status: 'published', active: true },
  { status: 'unpublished', unpublishedReason: 'salable' },
  { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'content' },
  { status: 'published', active: false },
  { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'stock' },
  { status: 'unpublished', unpublishedReason: 'under_review' },
  { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'multimedia' },
  { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'price' },
  { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'compliance' },
  { status: 'unpublished', unpublishedReason: 'not_for_sale', notForSaleReason: 'configuration' },
]

const recommendationFor = { price: 'Review price against market', multimedia: 'Add at least 3 images', compliance: 'Upload compliance certificate' }

const generated = []
let seq = 0
let skuSeller = 202610200100
let skuFb = 101354000
for (const f of families) {
  for (const color of f.colors) {
    for (const size of f.sizes) {
      const state = states[seq % states.length]
      const created = new Date(Date.UTC(2026, 9, 31, 15, 0, 0) - seq * 6 * 3600 * 1000).toISOString()
      generated.push(
        make({
          name: `${f.name} / ${color} / ${size}`,
          skuSeller: String(skuSeller++),
          skuFalabella: String(skuFb++),
          categoryPath: f.category,
          price: f.price,
          offerPrice: seq % 4 === 0 ? Math.round(f.price * 0.85) : null,
          stock: state.status === 'unpublished' && state.notForSaleReason === 'stock' ? 0 : 10 + ((seq * 37) % 490),
          recommendations: recommendationFor[state.notForSaleReason] ? [recommendationFor[state.notForSaleReason]] : [],
          createdAt: created,
          updatedAt: created,
          active: false,
          ...state,
        })
      )
      seq++
    }
  }
}

/* ---------- Drafts ---------- */

const draft = (name, categoryPath, createdAt) => make({ name, categoryPath, createdAt, status: 'draft' })

const drafts = [
  draft('Untitled Draft (2026-11-10 16:16:48)', SHIRTS, '2026-11-10T16:16:48Z'),
  draft('Untitled Draft (2026-11-10 15:16:27)', SHIRTS, '2026-11-10T15:16:27Z'),
  draft('QA TEST Price Update Polera 20261110', SHIRTS, '2026-11-10T11:02:10Z'),
  draft('Untitled Draft (2026-11-06 08:08:21)', CABINETS, '2026-11-06T08:08:21Z'),
  draft('Test Product UI Do Not Buy_Digital Laptop Plus_0670', CABINETS, '2026-11-06T07:40:00Z'),
  draft('Untitled Draft (2026-09-15 10:21:17)', SHOES, '2026-09-15T10:21:17Z'),
  draft('Untitled Draft (2026-09-15 10:20:15)', SCULPT, '2026-09-15T10:20:15Z'),
  draft('Notebook HP Pavilion 15 Core i5 16GB RAM 512GB SSD', LAPTOPS, '2026-09-08T09:00:00Z'),
  draft('Untitled Draft (2026-08-25 02:45:41)', SHIRTS, '2026-08-25T02:45:41Z'),
  draft('Test product', SHIRTS, '2026-08-25T02:30:00Z'),
]

/* ---------- Deleted ---------- */

const deleted = [
  ['Untitled Draft (2026-11-10 16:16:48)', '2026-11-10T16:16:48Z'],
  ['Untitled Draft (2026-11-10 15:16:27)', '2026-11-10T15:16:27Z'],
  ['QA TEST Price Update Polera 20261110', '2026-11-10T11:02:10Z'],
  ['Untitled Draft (2026-11-06 08:08:21)', '2026-11-06T08:08:21Z'],
  ['Untitled Draft (2026-10-28 13:12:09)', '2026-10-28T13:12:09Z'],
  ['Test product delete flow', '2026-10-20T10:00:00Z'],
].map(([name, createdAt]) => make({ name, createdAt, status: 'deleted', previousStatus: 'draft', categoryPath: SHIRTS }))

export const products = [...handCrafted, ...generated, ...drafts, ...deleted]
export const nextProductId = () => nextId++
export { make as makeProduct }
