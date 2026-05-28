const prisma = require('../prismaClient')

// GET tất cả settings (Public - dùng cho Landing Page)
exports.getAll = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany()
    // Chuyển sang dạng object { key: value } cho tiện dùng
    const result = {}
    settings.forEach(s => {
      result[s.setting_key] = s.setting_value
    })
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tất cả settings dạng list (Admin)
exports.getAllAdmin = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany()
    res.json({ success: true, data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET setting theo key
exports.getByKey = async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { setting_key: req.params.key }
    })
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy setting!' })
    }
    res.json({ success: true, data: setting })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST/PUT upsert setting (Admin)
// Body: { setting_key, setting_value, description }
exports.upsert = async (req, res) => {
  try {
    const { setting_key, setting_value, description } = req.body

    if (!setting_key) {
      return res.status(400).json({ success: false, message: 'setting_key là bắt buộc!' })
    }

    const existing = await prisma.systemSetting.findUnique({
      where: { setting_key }
    })

    let setting
    if (existing) {
      setting = await prisma.systemSetting.update({
        where: { setting_key },
        data: {
          setting_value,
          description: description || existing.description,
          Modify_by: req.user?.username || null
        }
      })
    } else {
      setting = await prisma.systemSetting.create({
        data: {
          setting_key,
          setting_value,
          description,
          Modify_by: req.user?.username || null
        }
      })
    }

    res.json({ success: true, data: setting })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT cập nhật nhiều settings cùng lúc (Admin)
// Body: { settings: [{ setting_key, setting_value }, ...] }
exports.bulkUpdate = async (req, res) => {
  try {
    const { settings } = req.body

    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'settings phải là mảng!' })
    }

    const results = []
    for (const item of settings) {
      const existing = await prisma.systemSetting.findUnique({
        where: { setting_key: item.setting_key }
      })

      if (existing) {
        const updated = await prisma.systemSetting.update({
          where: { setting_key: item.setting_key },
          data: {
            setting_value: item.setting_value,
            Modify_by: req.user?.username || null
          }
        })
        results.push(updated)
      } else {
        const created = await prisma.systemSetting.create({
          data: {
            setting_key: item.setting_key,
            setting_value: item.setting_value,
            description: item.description,
            Modify_by: req.user?.username || null
          }
        })
        results.push(created)
      }
    }

    res.json({ success: true, data: results })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE setting (Admin)
exports.delete = async (req, res) => {
  try {
    await prisma.systemSetting.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ success: true, message: 'Đã xóa setting!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
