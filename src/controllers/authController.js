const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const prisma = require('../prismaClient')

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập username và password!'
      })
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin || !admin.status) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa!'
      })
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không đúng!'
      })
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    // Tạo refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex')
    const refreshExpires = new Date()
    refreshExpires.setDate(refreshExpires.getDate() + 7) // 7 ngày

    // Lưu vào DB
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refresh_token: refreshToken,
        refresh_token_expires: refreshExpires
      }
    })

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: admin.id,
          username: admin.username,
          role: admin.role
        }
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message:"Đã xảy ra lỗi" })
  }
}

// Tạo tài khoản admin (seed)
exports.register = async (req, res) => {
  try {
    const { username, password, email, role } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập username và password!'
      })
    }

    const existing = await prisma.admin.findUnique({ where: { username } })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username đã tồn tại!' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        username,
        password_hash,
        email: email || null,
        role: role || 'Admin',
        status: true
      }
    })

    res.status(201).json({
      success: true,
      data: { id: admin.id, username: admin.username, role: admin.role }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Lấy thông tin admin hiện tại
exports.getMe = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true }
    })
    res.json({ success: true, data: admin })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Làm mới Access Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token là bắt buộc!' })
    }

    // Tìm admin có refresh token khớp và chưa hết hạn
    const admin = await prisma.admin.findFirst({
      where: {
        refresh_token: refreshToken,
        refresh_token_expires: {
          gt: new Date() // Phải còn hạn
        }
      }
    })

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn!' })
    }

    // Tạo Access Token mới
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    // (Tuỳ chọn) Tạo Refresh Token mới (Rotate token) để bảo mật hơn
    const newRefreshToken = crypto.randomBytes(40).toString('hex')
    const refreshExpires = new Date()
    refreshExpires.setDate(refreshExpires.getDate() + 7)

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refresh_token: newRefreshToken,
        refresh_token_expires: refreshExpires
      }
    })

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Đăng xuất (Huỷ Refresh Token)
exports.logout = async (req, res) => {
  try {
    const { id } = req.user
    
    await prisma.admin.update({
      where: { id },
      data: {
        refresh_token: null,
        refresh_token_expires: null
      }
    })

    res.json({ success: true, message: 'Đăng xuất thành công!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' })
    }

    const adminId = req.user.id
    
    // Tìm admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' })
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác!' })
    }

    // Mã hoá mật khẩu mới
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Cập nhật vào DB
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        password_hash: newPasswordHash
      }
    })

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
