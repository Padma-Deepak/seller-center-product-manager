import { Router } from 'express'
import productsRoutes from './products.routes.js'
import { currentUser } from '../data/user.mock.js'

const router = Router()

router.get('/health', (req, res) => res.json({ ok: true }))
router.get('/me', (req, res) => res.json(currentUser))
router.use('/products', productsRoutes)

export default router
