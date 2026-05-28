const prisma = require('../prismaClient')

// GET tất cả loại bằng (Public)
exports.getAll = async (req, res) => {
  try {
    const items = await prisma.licenseType.findMany({
      where: { is_deleted: false },
      orderBy: { code: 'asc' }
    })
    res.json({ success: true, data: items })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET theo ID
exports.getById = async (req, res) => {
  try {
    const item = await prisma.licenseType.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false }
    })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy!' })
    }
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST tạo mới (Admin)
exports.create = async (req, res) => {
  try {
    const { code, name, description } = req.body
    const item = await prisma.licenseType.create({
      data: {
        code,
        name,
        description,
        Created_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật (Admin)
exports.update = async (req, res) => {
  try {
    const { code, name, description } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (code !== undefined) data.code = code
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description

    const item = await prisma.licenseType.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE (Soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.licenseType.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
