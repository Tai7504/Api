const router = require('express').Router()
const ctrl = require('../controllers/authController')
const auth = require('../middlewares/auth')

// POST /api/auth/login
router.post('/login', ctrl.login)

// POST /api/auth/register 
// router.post('/register', ctrl.register)

// GET /api/auth/me (cần token)
router.get('/me', auth, ctrl.getMe)

// POST /api/auth/refresh-token
router.post('/refresh-token', ctrl.refreshToken)

// POST /api/auth/logout
router.post('/logout', auth, ctrl.logout)

// PUT /api/auth/change-password
router.put('/change-password', auth, ctrl.changePassword)

module.exports = router
