const router = require('express').Router()
const ctrl = require('../controllers/teacherController')
const { upload } = require('../middlewares/upload')
const auth = require('../middlewares/auth')

// Public
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)

// Admin
router.get('/admin/all', auth, ctrl.getAllAdmin)
router.post('/', auth, upload.single('image'), ctrl.create)
router.put('/sort-order', auth, ctrl.updateSortOrder)
router.put('/:id', auth, upload.single('image'), ctrl.update)
router.delete('/:id', auth, ctrl.delete)

module.exports = router
