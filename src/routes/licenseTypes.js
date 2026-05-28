const router = require('express').Router()
const ctrl = require('../controllers/licenseTypeController')
const auth = require('../middlewares/auth')

// Public
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)

// Admin
router.post('/', auth, ctrl.create)
router.put('/:id', auth, ctrl.update)
router.delete('/:id', auth, ctrl.delete)

module.exports = router
