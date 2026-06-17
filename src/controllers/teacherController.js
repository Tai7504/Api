const prisma = require('../prismaClient')
const { deleteUploadedFile } = require('../helpers/fileHelper')

// GET tất cả giáo viên (Public)
exports.getAll = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: true, is_deleted: false },
      orderBy: { Created_time: 'desc' }
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
      orderBy: { Created_time: 'desc' }
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
    const { name, description, status } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null

    const teacher = await prisma.teacher.create({
      data: {
        name,
        image,
        description,
        status: status !== 'false' && status !== false,
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
    const { name, description, status } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status === 'true' || status === true

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
