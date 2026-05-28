
## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQL Server
- **Auth**: JWT + bcryptjs
- **Upload**: Multer

---

## Cấu hình file .env

```env
DATABASE_URL="sqlserver://localhost:1433;database=DrivingSchoolDB;user=sa;password=YOUR_PASSWORD;trustServerCertificate=true;encrypt=true"

JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

PORT=8080

MAX_FILE_SIZE=5242880
```

---

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Cấu hình .env (DATABASE_URL, JWT_SECRET...)

# 3. Đồng bộ database schema
npm run prisma:push

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Seed dữ liệu mẫu
npm run seed

# 6. Chạy server
npm run dev
```

> **Lưu ý:** Cần bật TCP/IP trên SQL Server và đảm bảo port 1433 đang mở.

---

## Tài khoản mặc định

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | SuperAdmin |

---

## Postman Collection

Import file `postman/Driving_School_API.postman_collection.json` vào Postman để test.

- Login xong → token **tự động lưu** → các request Admin tự gắn token.
- Mỗi request đã có **data mẫu** sẵn.

---

## API Endpoints

### 🔐 Auth

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| POST | `/api/auth/login` | ❌ | Đăng nhập, trả JWT token |
| POST | `/api/auth/register` | ❌ | Tạo tài khoản admin (seed) |
| GET | `/api/auth/me` | ✅ | Thông tin admin hiện tại |

---

### 📚 Khóa học (Courses)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/courses` | ❌ | Danh sách khóa học (public) |
| GET | `/api/courses/:id` | ❌ | Chi tiết khóa học |
| GET | `/api/courses/admin/all` | ✅ | Tất cả khóa học (bao gồm ẩn) |
| POST | `/api/courses` | ✅ | Tạo mới (form-data + upload ảnh) |
| PUT | `/api/courses/:id` | ✅ | Cập nhật |
| DELETE | `/api/courses/:id` | ✅ | Xóa mềm |

---

### 🪪 Loại bằng (License Types)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/license-types` | ❌ | Danh sách loại bằng (A1, B1, B2, C...) |
| GET | `/api/license-types/:id` | ❌ | Chi tiết |
| POST | `/api/license-types` | ✅ | Tạo mới |
| PUT | `/api/license-types/:id` | ✅ | Cập nhật |
| DELETE | `/api/license-types/:id` | ✅ | Xóa mềm |

---

### 👨‍🏫 Giáo viên (Teachers)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/teachers` | ❌ | Danh sách giáo viên (public) |
| GET | `/api/teachers/:id` | ❌ | Chi tiết |
| GET | `/api/teachers/admin/all` | ✅ | Tất cả (bao gồm ẩn) |
| POST | `/api/teachers` | ✅ | Tạo mới + upload ảnh |
| PUT | `/api/teachers/:id` | ✅ | Cập nhật |
| DELETE | `/api/teachers/:id` | ✅ | Xóa mềm |

---

### 📰 Tin tức (News)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/news` | ❌ | Danh sách tin tức (public) |
| GET | `/api/news/:id` | ❌ | Chi tiết |
| GET | `/api/news/admin/all` | ✅ | Tất cả (bao gồm ẩn) |
| POST | `/api/news` | ✅ | Tạo mới + upload ảnh |
| PUT | `/api/news/:id` | ✅ | Cập nhật |
| DELETE | `/api/news/:id` | ✅ | Xóa mềm |

---

### 🏆 Thành tích (Achievements)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/achievements` | ❌ | Danh sách (public) |
| GET | `/api/achievements/:id` | ❌ | Chi tiết |
| GET | `/api/achievements/admin/all` | ✅ | Tất cả (bao gồm ẩn) |
| POST | `/api/achievements` | ✅ | Tạo mới + upload ảnh |
| PUT | `/api/achievements/:id` | ✅ | Cập nhật |
| DELETE | `/api/achievements/:id` | ✅ | Xóa mềm |

---

### ⚙️ Cài đặt hệ thống (System Settings)

Lưu trữ dạng key-value: `logo_url`, `hotline`, `address`, `email`, `facebook`, `google_map`...

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/system-settings` | ❌ | Tất cả settings (dạng object) |
| GET | `/api/system-settings/:key` | ❌ | Lấy theo key |
| GET | `/api/system-settings/admin/all` | ✅ | Tất cả (dạng list) |
| POST | `/api/system-settings` | ✅ | Tạo/cập nhật 1 setting |
| PUT | `/api/system-settings/bulk` | ✅ | Cập nhật nhiều settings |
| DELETE | `/api/system-settings/:id` | ✅ | Xóa |

---

### 🖼️ Banner

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/banners` | ❌ | Danh sách banner (public) |
| GET | `/api/banners/admin/all` | ✅ | Tất cả (bao gồm ẩn) |
| POST | `/api/banners` | ✅ | Tạo mới + upload ảnh |
| PUT | `/api/banners/:id` | ✅ | Cập nhật |
| DELETE | `/api/banners/:id` | ✅ | Xóa mềm |

---

### ⭐ Leads (Form từ Landing Page)

**`POST /api/leads` là PUBLIC** — Người dùng gửi form đăng ký từ Landing Page, không cần đăng nhập.

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| POST | `/api/leads` | ❌ | **Khách hàng đăng ký** |
| GET | `/api/leads` | ✅ | Danh sách leads (phân trang) |
| GET | `/api/leads/:id` | ✅ | Chi tiết lead |
| PUT | `/api/leads/:id` | ✅ | Cập nhật trạng thái + ghi chú |
| DELETE | `/api/leads/:id` | ✅ | Xóa mềm |

**Trạng thái lead:** 0=Mới, 1=Đang tư vấn, 2=Đã chốt, 3=Spam/Hủy

**Body mẫu (POST):**
```json
{
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "course_interested_id": 1,
  "customer_notes": "Tôi muốn học cuối tuần"
}
```

---

### 🎓 Học viên (Students)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/students` | ✅ | Danh sách học viên (phân trang) |
| GET | `/api/students/:id` | ✅ | Chi tiết + danh sách khóa học |
| POST | `/api/students` | ✅ | Tạo tài khoản học viên |
| PUT | `/api/students/:id` | ✅ | Cập nhật thông tin |
| DELETE | `/api/students/:id` | ✅ | Xóa mềm |

**Trạng thái tài khoản:** 0=Chờ kích hoạt, 1=Hoạt động, 2=Bị khóa

---

### 📝 Đăng ký khóa học (Course Registrations)

| Method | URL | Auth | Mô tả |
|--------|-----|------|-------|
| GET | `/api/course-registrations` | ✅ | Danh sách đăng ký (phân trang) |
| GET | `/api/course-registrations/:id` | ✅ | Chi tiết |
| POST | `/api/course-registrations` | ✅ | Tạo đăng ký cho học viên |
| PUT | `/api/course-registrations/:id` | ✅ | Cập nhật trạng thái |
| DELETE | `/api/course-registrations/:id` | ✅ | Xóa mềm |

**Trạng thái thanh toán:** 0=Chưa TT, 1=Đã cọc, 2=Đã TT đủ

**Trạng thái xử lý:** 0=Mới gửi form, 1=Xử lý hồ sơ, 2=Đã xếp lớp, 3=Hoàn thành

---

## Cấu trúc thư mục

```
e:\Api\
├── prisma/
│   └── schema.prisma           ← Database schema (11 bảng)
├── src/
│   ├── controllers/            ← Xử lý logic CRUD
│   ├── routes/                 ← Định nghĩa endpoints
│   ├── middlewares/
│   │   ├── auth.js             ← JWT verify
│   │   └── upload.js           ← Multer upload ảnh
│   ├── prismaClient.js         ← Prisma singleton
│   ├── seed.js                 ← Dữ liệu mẫu
│   └── app.js                  ← Entry point
├── uploads/                    ← Thư mục chứa ảnh upload
├── postman/                    ← Postman collection
├── .env                        ← Biến môi trường
├── .gitignore
├── package.json
└── README.md
```
