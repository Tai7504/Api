const prisma = require('../prismaClient')
const { deleteUploadedFile } = require('../helpers/fileHelper')

// GET tất cả (Public)
exports.getAll = async (req, res) => {
  try {
    const items = await prisma.achievement.findMany({
      where: { status: true, is_deleted: false },
      orderBy: { sort_order: 'asc' }
    })
    res.json({ success: true, data: items })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tất cả (Admin)
exports.getAllAdmin = async (req, res) => {
  try {
    const items = await prisma.achievement.findMany({
      where: { is_deleted: false },
      orderBy: { sort_order: 'asc' }
    })
    res.json({ success: true, data: items })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET theo ID
exports.getById = async (req, res) => {
  try {
    const item = await prisma.achievement.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false }
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

// POST tạo mới (Admin)
exports.create = async (req, res) => {
  try {
    const { title, description, sort_order, status } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null

    const item = await prisma.achievement.create({
      data: {
        title,
        image,
        description,
        sort_order: parseInt(sort_order) || 0,
        status: status !== 'false' && status !== false,
        Created_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật (Admin)
exports.update = async (req, res) => {
  try {
    const { title, description, sort_order, status } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (sort_order !== undefined) data.sort_order = parseInt(sort_order)
    if (status !== undefined) data.status = status === 'true' || status === true

    if (req.file) {
      const old = await prisma.achievement.findUnique({ where: { id: parseInt(req.params.id) } })
      deleteUploadedFile(old?.image)
      data.image = `/uploads/${req.file.filename}`
    }

    const item = await prisma.achievement.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: item })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE (Soft delete)
exports.delete = async (req, res) => {
  try {
    const achievement = await prisma.achievement.findUnique({ where: { id: parseInt(req.params.id) } })
    deleteUploadedFile(achievement?.image)

    await prisma.achievement.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa!' })
  } catch (error) {
    console.error('[ERROR]', req.method, req.originalUrl, error)
    res.status(500).json({ success: false, message: error.message })
  }
}
