const prisma = require('../prismaClient')
const { deleteUploadedFile } = require('../helpers/fileHelper')

// GET tất cả giáo viên (Public)
exports.getAll = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: true, is_deleted: false },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
    })
    res.json({ success: true, data: teachers })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tất cả (Admin)
exports.getAllAdmin = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { is_deleted: false },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
    })
    res.json({ success: true, data: teachers })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET theo ID
exports.getById = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false }
    })
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giáo viên!' })
    }
    res.json({ success: true, data: teacher })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST tạo mới (Admin)
exports.create = async (req, res) => {
  try {
    const { name, description, status, sort_order } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null

    const teacher = await prisma.teacher.create({
      data: {
        name,
        image,
        description,
        status: status !== 'false' && status !== false,
        sort_order: sort_order ? parseInt(sort_order) : 0,
        Created_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: teacher })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật (Admin)
exports.update = async (req, res) => {
  try {
    const { name, description, status, sort_order } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status === 'true' || status === true
    if (sort_order !== undefined) data.sort_order = parseInt(sort_order)

    if (req.file) {
      const old = await prisma.teacher.findUnique({ where: { id: parseInt(req.params.id) } })
      deleteUploadedFile(old?.image)
      data.image = `/uploads/${req.file.filename}`
    }

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: teacher })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE (Soft delete)
exports.delete = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: parseInt(req.params.id) } })
    deleteUploadedFile(teacher?.image)

    await prisma.teacher.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa giáo viên!' })
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
      prisma.teacher.update({
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
