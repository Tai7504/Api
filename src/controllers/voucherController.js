const prisma = require('../prismaClient')

// ===== PUBLIC: Lấy tất cả voucher active cho Client =====
exports.getActive = async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { status: true, is_deleted: false },
      include: {
        courses: {
          select: {
            course_id: true
          }
        }
      },
      orderBy: { Created_time: 'desc' }
    })
    
    // Format lại dữ liệu courses: [ { course_id: 1 } ] thành [1] cho client dễ dùng
    const formatted = vouchers.map(v => ({
      ...v,
      course_ids: v.courses.map(vc => vc.course_id)
    }))

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ===== ADMIN: Lấy tất cả voucher (kể cả inactive) =====
exports.getAllAdmin = async (req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { is_deleted: false },
      include: {
        courses: {
          include: {
            course: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { Created_time: 'desc' }
    })
    
    const formatted = vouchers.map(v => ({
      ...v,
      course_ids: v.courses.map(vc => vc.course_id),
      course_names: v.courses.map(vc => vc.course?.name).filter(Boolean)
    }))

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Lấy chi tiết voucher
exports.getById = async (req, res) => {
  try {
    const voucher = await prisma.voucher.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false },
      include: {
        courses: {
          include: {
            course: { select: { id: true, name: true } }
          }
        }
      }
    })
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy voucher!' })
    }
    
    const formatted = {
      ...voucher,
      course_ids: voucher.courses.map(vc => vc.course_id),
      course_names: voucher.courses.map(vc => vc.course?.name).filter(Boolean)
    }

    res.json({ success: true, data: formatted })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Tạo mới voucher
exports.create = async (req, res) => {
  try {
    const { code, discount, description, terms, status, course_ids } = req.body

    if (!code || discount === undefined) {
      return res.status(400).json({ success: false, message: 'Mã voucher và phần trăm giảm giá là bắt buộc!' })
    }

    const discountVal = parseInt(discount)
    if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      return res.status(400).json({ success: false, message: 'Giảm giá phải nằm trong khoảng từ 0 đến 100%!' })
    }

    // Kiểm tra trùng mã (bao gồm cả các mã đã bị soft-deleted để tránh lỗi Unique Constraint của DB)
    const existing = await prisma.voucher.findFirst({
      where: { code: code.trim() }
    })
    
    // Parse course_ids nếu được gửi dưới dạng string JSON
    let parsedCourseIds = []
    if (course_ids) {
      parsedCourseIds = Array.isArray(course_ids) ? course_ids : JSON.parse(course_ids)
    }

    if (existing) {
      if (!existing.is_deleted) {
        return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại!' })
      }

      // Nếu voucher đã tồn tại nhưng ở trạng thái bị xóa mềm (is_deleted: true),
      // ta tiến hành khôi phục (is_deleted: false) và cập nhật thông tin mới.
      
      // 1. Xóa các liên kết khóa học cũ của voucher này
      await prisma.voucherCourse.deleteMany({
        where: { voucher_id: existing.id }
      })

      // 2. Khôi phục và cập nhật
      const voucher = await prisma.voucher.update({
        where: { id: existing.id },
        data: {
          discount: discountVal,
          description: description || null,
          terms: terms || null,
          status: status !== false && status !== 'false',
          is_deleted: false, // Khôi phục trạng thái hoạt động
          Modify_by: req.user?.username || null,
          courses: {
            create: parsedCourseIds.map(cId => ({ course_id: parseInt(cId) }))
          }
        },
        include: {
          courses: true
        }
      })

      return res.status(200).json({ success: true, data: voucher, message: 'Khôi phục và cập nhật voucher thành công!' })
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.trim(),
        discount: discountVal,
        description: description || null,
        terms: terms || null,
        status: status !== false && status !== 'false',
        Created_by: req.user?.username || null,
        courses: {
          create: parsedCourseIds.map(cId => ({ course_id: parseInt(cId) }))
        }
      },
      include: {
        courses: true
      }
    })

    res.status(201).json({ success: true, data: voucher })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Cập nhật voucher
exports.update = async (req, res) => {
  try {
    const { code, discount, description, terms, status, course_ids } = req.body
    const voucherId = parseInt(req.params.id)

    const data = { Modify_by: req.user?.username || null }

    if (code !== undefined) {
      const codeTrim = code.trim()
      // Kiểm tra trùng mã với voucher khác (bao gồm cả các mã đã bị soft-deleted)
      const existing = await prisma.voucher.findFirst({
        where: { code: codeTrim, id: { not: voucherId } }
      })
      if (existing) {
        return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại trong hệ thống (kể cả đã bị xóa mềm)!' })
      }
      data.code = codeTrim
    }

    if (discount !== undefined) {
      const discountVal = parseInt(discount)
      if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
        return res.status(400).json({ success: false, message: 'Giảm giá phải nằm trong khoảng từ 0 đến 100%!' })
      }
      data.discount = discountVal
    }

    if (description !== undefined) data.description = description
    if (terms !== undefined) data.terms = terms
    if (status !== undefined) data.status = status === 'true' || status === true

    if (course_ids !== undefined) {
      // Xóa các liên kết cũ
      await prisma.voucherCourse.deleteMany({
        where: { voucher_id: voucherId }
      })
      
      let parsedCourseIds = []
      if (course_ids) {
        parsedCourseIds = Array.isArray(course_ids) ? course_ids : JSON.parse(course_ids)
      }
      
      data.courses = {
        create: parsedCourseIds.map(cId => ({ course_id: parseInt(cId) }))
      }
    }

    const updated = await prisma.voucher.update({
      where: { id: voucherId },
      data,
      include: {
        courses: true
      }
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ADMIN: Xóa voucher (Soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.voucher.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa voucher thành công!' })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}
