const prisma = require('../prismaClient')
const bcrypt = require('bcryptjs')

// ADMIN: Danh sách học viên
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, account_status } = req.query
    const where = { is_deleted: false }

    if (account_status !== undefined) where.account_status = parseInt(account_status)

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { created_time: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        select: {
          id: true, username: true, full_name: true, phone: true,
          email: true, address: true, account_status: true,
          created_time: true,
          _count: { select: { registrations: true } }
        }
      }),
      prisma.student.count({ where })
    ])

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Chi tiết học viên + danh sách đăng ký khóa học
exports.getById = async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false },
      include: {
        registrations: {
          where: { is_deleted: false },
          include: { course: { select: { id: true, name: true, price: true } } }
        }
      }
    })
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên!' })
    }
    // Không trả password
    const { password_hash, ...data } = student
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Tạo tài khoản học viên
exports.create = async (req, res) => {
  try {
    const { username, password, full_name, phone, email, address } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập username và password!'
      })
    }

    const existing = await prisma.student.findUnique({ where: { username } })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username đã tồn tại!' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const student = await prisma.student.create({
      data: {
        username,
        password_hash,
        full_name,
        phone,
        email,
        address,
        account_status: 1 // Hoạt động
      }
    })

    const { password_hash: _, ...data } = student
    res.status(201).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Cập nhật thông tin học viên
exports.update = async (req, res) => {
  try {
    const { full_name, phone, email, address, account_status } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (full_name !== undefined) data.full_name = full_name
    if (phone !== undefined) data.phone = phone
    if (email !== undefined) data.email = email
    if (address !== undefined) data.address = address
    if (account_status !== undefined) data.account_status = parseInt(account_status)

    const student = await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    const { password_hash, ...result } = student
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Xóa (soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.student.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa học viên!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
