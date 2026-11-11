import { Router } from 'express'
import * as ctrl from '../controllers/products.controller.js'

const router = Router()

// Static paths must come before "/:id"
router.get('/', ctrl.list)
router.get('/counts', ctrl.counts)
router.get('/export', ctrl.exportCsv)
router.post('/', ctrl.create)
router.post('/bulk', ctrl.bulkAction)
router.patch('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)
router.post('/:id/restore', ctrl.restoreOne)

export default router
