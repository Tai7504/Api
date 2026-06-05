const router = require('express').Router()
const ctrl = require('../controllers/voucherController')
const auth = require('../middlewares/auth')

// Public
router.get('/', ctrl.getActive)

// Admin
router.get('/admin/all', auth, ctrl.getAllAdmin)
router.get('/:id', auth, ctrl.getById)
router.post('/', auth, ctrl.create)
router.put('/:id', auth, ctrl.update)
router.delete('/:id', auth, ctrl.delete)

module.exports = router
