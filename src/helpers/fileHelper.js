const fs = require('fs')
const path = require('path')

/**
 * Xóa file ảnh đã upload trên server
 * @param {string|null} filePath - Đường dẫn tương đối của ảnh (ví dụ: /uploads/abc.jpg)
 */
const deleteUploadedFile = (filePath) => {
  if (!filePath) return
  const fullPath = path.join(__dirname, '../../uploads', path.basename(filePath))
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
}

module.exports = { deleteUploadedFile }
