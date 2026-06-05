const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
process.setMaxListeners(20)

const app = express()

// ===== MIDDLEWARE =====
const corsOrigins = (process.env.CORS_ORIGINS || 'http://103.90.225.223:5173,http://103.90.225.223:5000').split(',')

app.use(cors({
  origin: corsOrigins,
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve ảnh tĩnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/license-types', require('./routes/licenseTypes'))
app.use('/api/teachers', require('./routes/teachers'))
app.use('/api/news', require('./routes/news'))
app.use('/api/achievements', require('./routes/achievements'))
app.use('/api/system-settings', require('./routes/systemSettings'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/wcu-images', require('./routes/wcuImages'))
app.use('/api/leads', require('./routes/leads'))
app.use('/api/students', require('./routes/students'))
app.use('/api/course-registrations', require('./routes/courseRegistrations'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/vouchers', require('./routes/vouchers'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running!' })
})

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack)

  // Xử lý lỗi multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ảnh vượt quá kích thước cho phép (tối đa 10MB)'
    })
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Có lỗi xảy ra!'
  })
})

// ===== START SERVER =====
const PORT = process.env.PORT || 8080
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Driving School API đang chạy tại http://localhost:${PORT}`)
  console.log(` Health check: http://localhost:${PORT}/api/health`)
  console.log(``)
  console.log(`API Endpoints:`)
  console.log(`   POST /api/auth/login`)
  console.log(`   GET  /api/courses`)
  console.log(`   GET  /api/license-types`)
  console.log(`   GET  /api/teachers`)
  console.log(`   GET  /api/news`)
  console.log(`   GET  /api/achievements`)
  console.log(`   GET  /api/system-settings`)
  console.log(`   GET  /api/banners`)
  console.log(`   POST /api/leads              ← Form Landing Page`)
  console.log(`   GET  /api/students            ← Admin`)
  console.log(`   GET  /api/course-registrations ← Admin`)
})
