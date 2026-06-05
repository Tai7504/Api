const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '../../uploads')
const CHUNK_DIR = path.join(__dirname, '../../uploads/chunks')

// Nhận từng chunk
exports.uploadChunk = async (req, res) => {
  try {
    const { fileId, chunkIndex, totalChunks, fileName } = req.body

    if (!fileId || chunkIndex === undefined || !totalChunks) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu fileId, chunkIndex hoặc totalChunks!'
      })
    }

    res.json({
      success: true,
      message: `Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} da nhan!`,
      data: { fileId, chunkIndex: parseInt(chunkIndex), totalChunks: parseInt(totalChunks) }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Ghép chunks lại thành file hoàn chỉnh
exports.mergeChunks = async (req, res) => {
  try {
    const { fileId, totalChunks, fileName } = req.body

    if (!fileId || !totalChunks || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu fileId, totalChunks hoặc fileName!'
      })
    }

    // Kiểm tra đủ chunks chưa
    const total = parseInt(totalChunks)
    for (let i = 0; i < total; i++) {
      const chunkPath = path.join(CHUNK_DIR, `${fileId}_${i}`)
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({
          success: false,
          message: `Thiếu chunk ${i}! Vui lòng upload lại.`
        })
      }
    }

    // Tạo tên file duy nhất
    const ext = path.extname(fileName)
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext
    const finalPath = path.join(UPLOAD_DIR, uniqueName)

    // Ghép chunks
    const writeStream = fs.createWriteStream(finalPath)

    for (let i = 0; i < total; i++) {
      const chunkPath = path.join(CHUNK_DIR, `${fileId}_${i}`)
      const chunkData = fs.readFileSync(chunkPath)
      writeStream.write(chunkData)

      // Xóa chunk sau khi ghép
      fs.unlinkSync(chunkPath)
    }

    writeStream.end()

    writeStream.on('finish', () => {
      res.json({
        success: true,
        message: 'Upload thành công!',
        data: {
          fileName: uniqueName,
          imageUrl: `/uploads/${uniqueName}`,
          fileSize: fs.statSync(finalPath).size
        }
      })
    })

    writeStream.on('error', (err) => {
      res.status(500).json({ success: false, message: err.message })
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Hủy upload - xóa chunks đã upload
exports.cancelUpload = async (req, res) => {
  try {
    const { fileId } = req.body

    if (!fileId) {
      return res.status(400).json({ success: false, message: 'thiếu fileId!' })
    }

    // Xóa tất cả chunks của fileId
    if (fs.existsSync(CHUNK_DIR)) {
      const files = fs.readdirSync(CHUNK_DIR)
      files.forEach(file => {
        if (file.startsWith(fileId)) {
          fs.unlinkSync(path.join(CHUNK_DIR, file))
        }
      })
    }

    res.json({ success: true, message: ' Hủy upload!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
