const prisma = require('../prismaClient')
const fs = require('fs')
const path = require('path')

// GET tất cả (Public)
exports.getAll = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null
    const limit = req.query.limit ? parseInt(req.query.limit) : 6

    if (page) {
      const skip = (page - 1) * limit
      const [totalRecords, news] = await Promise.all([
        prisma.news.count({ where: { status: true, is_deleted: false } }),
        prisma.news.findMany({
          where: { status: true, is_deleted: false },
          orderBy: { Created_time: 'desc' },
          skip,
          take: limit
        })
      ])
      return res.json({
        success: true,
        data: news,
        pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) }
      })
    }

    const news = await prisma.news.findMany({
      where: { status: true, is_deleted: false },
      orderBy: { Created_time: 'desc' }
    })
    res.json({ success: true, data: news })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tất cả (Admin)
exports.getAllAdmin = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null
    const limit = req.query.limit ? parseInt(req.query.limit) : 6

    if (page) {
      const skip = (page - 1) * limit
      const [totalRecords, news] = await Promise.all([
        prisma.news.count({ where: { is_deleted: false } }),
        prisma.news.findMany({
          where: { is_deleted: false },
          orderBy: { Created_time: 'desc' },
          skip,
          take: limit
        })
      ])
      return res.json({
        success: true,
        data: news,
        pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) }
      })
    }

    const news = await prisma.news.findMany({
      where: { is_deleted: false },
      orderBy: { Created_time: 'desc' }
    })
    res.json({ success: true, data: news })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET theo ID
exports.getById = async (req, res) => {
  try {
    const news = await prisma.news.findFirst({
      where: { id: parseInt(req.params.id), is_deleted: false }
    })
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức!' })
    }
    res.json({ success: true, data: news })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST tạo mới (Admin)
exports.create = async (req, res) => {
  try {
    const { title, sapo, content, tags, status } = req.body
    const thumbnail_image = req.file ? `/uploads/${req.file.filename}` : null

    const news = await prisma.news.create({
      data: {
        title,
        thumbnail_image,
        sapo,
        content,
        tags,
        status: status !== 'false' && status !== false,
        Created_by: req.user?.username || null
      }
    })
    res.status(201).json({ success: true, data: news })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật (Admin)
exports.update = async (req, res) => {
  try {
    const { title, sapo, content, tags, status } = req.body
    const data = { Modify_by: req.user?.username || null }

    if (title !== undefined) data.title = title
    if (sapo !== undefined) data.sapo = sapo
    if (content !== undefined) data.content = content
    if (tags !== undefined) data.tags = tags
    if (status !== undefined) data.status = status === 'true' || status === true

    if (req.file) {
      const old = await prisma.news.findUnique({ where: { id: parseInt(req.params.id) } })
      if (old?.thumbnail_image) {
        const oldPath = path.join(__dirname, '../../', old.thumbnail_image)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      data.thumbnail_image = `/uploads/${req.file.filename}`
    }

    const news = await prisma.news.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json({ success: true, data: news })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE (Soft delete)
exports.delete = async (req, res) => {
  try {
    await prisma.news.update({
      where: { id: parseInt(req.params.id) },
      data: { is_deleted: true, Modify_by: req.user?.username || null }
    })
    res.json({ success: true, message: 'Đã xóa tin tức!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
