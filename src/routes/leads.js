const router = require('express').Router()
const ctrl = require('../controllers/leadController')
const auth = require('../middlewares/auth')

//  Khách hàng gửi form từ Landing Page
router.post('/', ctrl.create)

// Admin - Quản lý leads
router.get('/', auth, ctrl.getAll)
router.get('/:id', auth, ctrl.getById)
router.put('/:id', auth, ctrl.update)
router.delete('/:id', auth, ctrl.delete)

module.exports = router
