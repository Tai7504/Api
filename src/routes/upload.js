const router = require('express').Router()
const ctrl = require('../controllers/uploadController')
const { chunkUpload, upload } = require('../middlewares/upload')
const auth = require('../middlewares/auth')

// Upload file đơn giản (logo, ảnh nhỏ)
router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file nào được upload!' })
  }
  res.json({
    success: true,
    data: { url: `/uploads/${req.file.filename}`, fileName: req.file.filename }
  })
})

// Upload chunk (Admin - cần auth)
router.post('/chunk', auth, chunkUpload.single('chunk'), ctrl.uploadChunk)

// Ghép chunks thành file hoàn chỉnh
router.post('/merge', auth, ctrl.mergeChunks)

// Hủy upload
router.post('/cancel', auth, ctrl.cancelUpload)

module.exports = router
