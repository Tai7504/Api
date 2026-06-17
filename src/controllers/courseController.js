const prisma = require('../prismaClient')
const { deleteUploadedFile } = require('../helpers/fileHelper')

// GET tất cả (Public - chỉ active, chưa xóa)
exports.getAll = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null
    const limit = req.query.limit ? parseInt(req.query.limit) : 8

    if (page) {
      const skip = (page - 1) * limit
      const [totalRecords, courses] = await Promise.all([
        prisma.course.count({ where: { status: true, is_deleted: false } }),
        prisma.course.findMany({
          where: { status: true, is_deleted: false },
          include: { license_type: true },
          orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
          skip,
          take: limit
        })
      ])
      return res.json({
        success: true,
        data: courses,
        pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) }
      })
    }

    const courses = await prisma.course.findMany({
      where: { status: true, is_deleted: false },
      include: { license_type: true },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
    })
    res.json({ success: true, data: courses })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tất cả (Admin - bao gồm ẩn)
exports.getAllAdmin = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null
    const limit = req.query.limit ? parseInt(req.query.limit) : 8

    if (page) {
      const skip = (page - 1) * limit
      const [totalRecords, courses] = await Promise.all([
        prisma.course.count({ where: { is_deleted: false } }),
        prisma.course.findMany({
          where: { is_deleted: false },
          include: {
            license_type: true,
            _count: { select: { leads: true, registrations: true } }
          },
          orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
          skip,
          take: limit
        })
      ])
      return res.json({
        success: true,
        data: courses,
        pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) }
      })
    }

    const courses = await prisma.course.findMany({
      where: { is_deleted: false },
      include: {
        license_type: true,
        _count: { select: { leads: true, registrations: true } }
      },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
    })
    res.json({ success: true, data: courses })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET theo ID
exports.getById = async (req, res) => {
  try {
    const course = await prisma.course.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false },
      include: { license_type: true }
    })
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học!' })
    }
    res.json({ success: true, data: course })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST tạo mới (Admin)
exports.create = async (req, res) => {
  try {
    const { name, description, content, price, discount_percentage, license_type_id, status, sort_order } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null

    const course = await prisma.course.create({
      data: {
        name,
        image,
        description,
        content: content || null,
        price: price ? parseFloat(price) : null,
        discount_percentage: discount_percentage ? parseInt(discount_percentage) : 0,
        license_type_id: license_type_id ? parseInt(license_type_id) : null,
        status: status !== 'false' && status !== false,
        sort_order: sort_order ? parseInt(sort_order) : 0,
        Created_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: course })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật (Admin)
exports.update = async (req, res) => {
  try {
    const { name, description, content, price, discount_percentage, license_type_id, status, sort_order } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (content !== undefined) data.content = content || null
    if (price !== undefined) data.price = parseFloat(price)
    if (discount_percentage !== undefined) data.discount_percentage = parseInt(discount_percentage)
    if (license_type_id !== undefined) data.license_type_id = license_type_id ? parseInt(license_type_id) : null
    if (status !== undefined) data.status = status === 'true' || status === true
    if (sort_order !== undefined) data.sort_order = parseInt(sort_order)

    if (req.file) {
      const old = await prisma.course.findUnique({ where: { id: parseInt(req.params.id) } })
      deleteUploadedFile(old?.image)
      data.image = `/uploads/${req.file.filename}`
    }

    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: course })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE (Soft delete)
exports.delete = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: parseInt(req.params.id) } })
    deleteUploadedFile(course?.image)

    await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa khóa học!' })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật nhanh thứ tự (Bulk update sort_order)
// Body: { sortData: [{ id: 1, sort_order: 1 }, { id: 2, sort_order: 2 }] }
exports.updateSortOrder = async (req, res) => {
  try {
    const { sortData } = req.body
    if (!Array.isArray(sortData)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu sortData phải là mảng!' })
    }

    const updates = sortData.map(item => 
      prisma.course.update({
        where: { id: parseInt(item.id) },
        data: { sort_order: parseInt(item.sort_order) }
      })
    )
    await prisma.$transaction(updates)

    res.json({ success: true, message: 'Cập nhật thứ tự thành công!' })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}
