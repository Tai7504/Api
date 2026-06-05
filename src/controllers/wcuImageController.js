const prisma = require('../prismaClient')
const fs = require('fs')
const path = require('path')

// GET tất cả ảnh WCU (Public)
exports.getAll = async (req, res) => {
  try {
    const images = await prisma.wcuImage.findMany({
      where: { status: true, is_deleted: false },
      orderBy: { display_order: 'asc' }
    })
    res.json({ success: true, data: images })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tất cả (Admin)
exports.getAllAdmin = async (req, res) => {
  try {
    const images = await prisma.wcuImage.findMany({
      where: { is_deleted: false },
      orderBy: { display_order: 'asc' }
    })
    res.json({ success: true, data: images })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST tạo mới (Admin)
exports.create = async (req, res) => {
  try {
    const { title, display_order, status } = req.body
    const image_url = req.file ? `/uploads/${req.file.filename}` : null

    if (!image_url) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload ảnh!' })
    }

    const image = await prisma.wcuImage.create({
      data: {
        title,
        image_url,
        display_order: parseInt(display_order) || 0,
        status: status !== 'false' && status !== false,
        Created_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: image })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật (Admin)
exports.update = async (req, res) => {
  try {
    const { title, display_order, status } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (title !== undefined) data.title = title
    if (display_order !== undefined) data.display_order = parseInt(display_order)
    if (status !== undefined) data.status = status === 'true' || status === true

    if (req.file) {
      const old = await prisma.wcuImage.findUnique({ where: { id: parseInt(req.params.id) } })
      if (old?.image_url) {
        const oldPath = path.join(__dirname, '../../', old.image_url)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      data.image_url = `/uploads/${req.file.filename}`
    }

    const image = await prisma.wcuImage.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: image })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE (Soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.wcuImage.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa ảnh!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
