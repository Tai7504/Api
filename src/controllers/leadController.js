const prisma = require('../prismaClient')

// ===== PUBLIC: Khách hàng gửi form từ Landing Page → tạo Lead =====
exports.create = async (req, res) => {
  try {
    const { full_name, phone, email, address, course_interested_id, customer_notes, applied_voucher_code } = req.body

    // Validate bắt buộc
    if (!full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập họ tên và số điện thoại!'
      })
    }

    let original_price = null
    let final_price = null
    let voucher_code = null

    if (course_interested_id) {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(course_interested_id) }
      })
      if (course && course.price) {
        original_price = Number(course.price)
        final_price = original_price

        if (applied_voucher_code) {
          const voucher = await prisma.voucher.findFirst({
            where: {
              code: applied_voucher_code.trim(),
              status: true,
              is_deleted: false
            },
            include: {
              courses: true
            }
          })

          if (voucher) {
            const isApplicable = voucher.courses.length === 0 ||
              voucher.courses.some(vc => vc.course_id === parseInt(course_interested_id))

            if (isApplicable) {
              voucher_code = voucher.code
              final_price = original_price - Math.round(original_price * (voucher.discount / 100))
            }
          }
        }
      }
    }

    const lead = await prisma.lead.create({
      data: {
        full_name,
        phone,
        email: email || null,
        address: address || null,
        course_interested_id: course_interested_id ? parseInt(course_interested_id) : null,
        customer_notes: customer_notes || null,
        applied_voucher_code: voucher_code,
        original_price: original_price,
        final_price: final_price,
        status: 0
      }
    })

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.',
      data: lead
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ===== ADMIN: Danh sách leads =====
exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = { is_deleted: false }

    if (status !== undefined) where.status = parseInt(status)

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          course_interested: { select: { id: true, name: true, price: true } }
        },
        orderBy: { created_time: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.lead.count({ where })
    ])

    res.json({
      success: true,
      data: leads,
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

// ADMIN: Chi tiết lead
exports.getById = async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false },
      include: { course_interested: true }
    })
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy!' })
    }
    res.json({ success: true, data: lead })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Cập nhật trạng thái + ghi chú telesale
// status: 0=Mới, 1=Đang tư vấn, 2=Đã chốt, 3=Spam/Hủy
exports.update = async (req, res) => {
  try {
    const { status, telesale_notes, customer_notes, email, address } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (status !== undefined) data.status = parseInt(status)
    if (telesale_notes !== undefined) data.telesale_notes = telesale_notes
    if (customer_notes !== undefined) data.customer_notes = customer_notes
    if (email !== undefined) data.email = email
    if (address !== undefined) data.address = address

    const lead = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: lead })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Xóa (soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
