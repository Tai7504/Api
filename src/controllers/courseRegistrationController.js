const prisma = require('../prismaClient')

// ADMIN: Danh sách giao dịch đăng ký
exports.getAll = async (req, res) => {
  try {
    const { payment_status, process_status, page = 1, limit = 20 } = req.query
    const where = { is_deleted: false }

    if (payment_status !== undefined) where.payment_status = parseInt(payment_status)
    if (process_status !== undefined) where.process_status = parseInt(process_status)

    const [items, total] = await Promise.all([
      prisma.courseRegistration.findMany({
        where,
        include: {
          student: { select: { id: true, full_name: true, phone: true, email: true } },
          course: { select: { id: true, name: true, price: true } }
        },
        orderBy: { created_time: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.courseRegistration.count({ where })
    ])

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Chi tiết
exports.getById = async (req, res) => {
  try {
    const item = await prisma.courseRegistration.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false },
      include: {
        student: true,
        course: true
      }
    })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy!' })
    }
    res.json({ success: true, data: item })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Tạo đăng ký khóa học cho học viên
exports.create = async (req, res) => {
  try {
    const { student_id, course_id, current_price, notes } = req.body

    if (!student_id || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id và course_id là bắt buộc!'
      })
    }

    const item = await prisma.courseRegistration.create({
      data: {
        student_id: parseInt(student_id),
        course_id: parseInt(course_id),
        current_price: current_price ? parseFloat(current_price) : null,
        payment_status: 0,
        process_status: 0,
        notes,
        Modify_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Cập nhật trạng thái
// payment_status: 0=Chưa TT, 1=Đã cọc, 2=Đã TT đủ
// process_status: 0=Mới gửi form, 1=Xử lý hồ sơ, 2=Đã xếp lớp, 3=Hoàn thành
exports.update = async (req, res) => {
  try {
    const { payment_status, process_status, current_price, notes } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (payment_status !== undefined) data.payment_status = parseInt(payment_status)
    if (process_status !== undefined) data.process_status = parseInt(process_status)
    if (current_price !== undefined) data.current_price = parseFloat(current_price)
    if (notes !== undefined) data.notes = notes

    const item = await prisma.courseRegistration.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: item })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Xóa (soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.courseRegistration.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa!' })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}
