const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ===== UPLOAD THƯỜNG (ảnh nhỏ, dưới 2MB) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, unique + ext)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ được upload file ảnh (jpg, png, gif, webp, avif)!'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB cho upload thường
  }
})

// ===== CHUNK UPLOAD (ảnh lớn, chia nhỏ) =====
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const chunkDir = path.join(__dirname, '../../uploads/chunks')
    if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true })
    cb(null, chunkDir)
  },
  filename: (req, file, cb) => {
    // Lưu chunk với tên: fileId_chunkIndex
    const { fileId, chunkIndex } = req.body
    cb(null, `${fileId}_${chunkIndex}`)
  }
})

const chunkUpload = multer({
  storage: chunkStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Mỗi chunk tối đa 10MB
  }
})

module.exports = { upload, chunkUpload }
