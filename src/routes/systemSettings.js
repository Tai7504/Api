const router = require('express').Router()
const ctrl = require('../controllers/systemSettingController')
const auth = require('../middlewares/auth')

// Public - Landing page lấy thông tin trung tâm
router.get('/', ctrl.getAll)
router.get('/:key', ctrl.getByKey)

// Admin
router.get('/admin/all', auth, ctrl.getAllAdmin)
router.post('/', auth, ctrl.upsert)
router.put('/bulk', auth, ctrl.bulkUpdate)
router.delete('/:id', auth, ctrl.delete)

module.exports = router
