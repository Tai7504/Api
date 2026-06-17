/**
 * Script seed dữ liệu ban đầu
 * Chạy: node src/seed.js
 */

const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log(' Bắt đầu seed dữ liệu...\n')

  // 1. Tạo tài khoản admin
  const password_hash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash,
      email: 'admin@truonglaixe.vn',
      role: 'SuperAdmin',
      status: true
    }
  })
  console.log(' Admin:', admin.username)

  // 2. Loại bằng lái
  const licenseTypes = [
    { code: 'A1', name: 'Hạng A1', description: 'Xe mô tô có dung tích xi lanh dưới 175cm3' },
    { code: 'B1', name: 'Hạng B1', description: 'Xe ô tô chở người đến 9 chỗ (số tự động)' },
    { code: 'B2', name: 'Hạng B2', description: 'Xe ô tô chở người đến 9 chỗ (số sàn + số tự động)' },
    { code: 'C', name: 'Hạng C', description: 'Xe ô tô tải có trọng tải trên 3.500kg' },
  ]
  for (const lt of licenseTypes) {
    await prisma.licenseType.upsert({
      where: { code: lt.code },
      update: { name: lt.name, description: lt.description },
      create: { ...lt, Created_by: 'system' }
    })
  }
  console.log(' Loại bằng lái:', licenseTypes.length, 'items')

  // 3. Khóa học mẫu
  const licenseTypeMap = {}
  const allLT = await prisma.licenseType.findMany()
  for (const lt of allLT) { licenseTypeMap[lt.code] = lt.id }

  const courses = [
    { name: 'Khóa học lái xe hạng B1', price: 5000000, discount_percentage: 10, license_code: 'B1', Created_by: 'admin' },
    { name: 'Khóa học lái xe hạng B2', price: 7000000, discount_percentage: 5, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe hạng C', price: 12000000, discount_percentage: 0, license_code: 'C', Created_by: 'admin' },
    { name: 'Khóa học lái xe ô tô B1 - Cơ bản', price: 5500000, discount_percentage: 0, license_code: 'B1', Created_by: 'admin' },
    { name: 'Khóa học lái xe ô tô B1 - Nâng cao', price: 6500000, discount_percentage: 10, license_code: 'B1', Created_by: 'admin' },
    { name: 'Khóa học lái xe ô tô B2 - Số sàn', price: 8000000, discount_percentage: 5, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe ô tô B2 - Số tự động', price: 8500000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe ô tô B2 - VIP', price: 15000000, discount_percentage: 15, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe tải C - Tiêu chuẩn', price: 12000000, discount_percentage: 0, license_code: 'C', Created_by: 'admin' },
    { name: 'Khóa học lái xe tải C - Chuyên nghiệp', price: 16000000, discount_percentage: 10, license_code: 'C', Created_by: 'admin' },
    { name: 'Khóa học lái xe máy A1', price: 3000000, discount_percentage: 0, license_code: 'A1', Created_by: 'admin' },
    { name: 'Khóa học ôn tập lý thuyết B1', price: 2000000, discount_percentage: 0, license_code: 'B1', Created_by: 'admin' },
    { name: 'Khóa học ôn tập lý thuyết B2', price: 2500000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học thực hành sa hình B2', price: 4000000, discount_percentage: 5, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học thực hành đường trường B2', price: 4500000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe B2 cấp tốc 2 tháng', price: 10000000, discount_percentage: 10, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe B1 cuối tuần', price: 6000000, discount_percentage: 5, license_code: 'B1', Created_by: 'admin' },
    { name: 'Khóa học lái xe B2 ban đêm', price: 9000000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học nâng hạng B1 lên B2', price: 5000000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học nâng hạng B2 lên C', price: 8000000, discount_percentage: 10, license_code: 'C', Created_by: 'admin' },
    { name: 'Khóa học phục hồi bằng lái B2', price: 4000000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe dành cho nữ', price: 7500000, discount_percentage: 5, license_code: 'B2', Created_by: 'admin' },
    { name: 'Khóa học lái xe cho người đi làm', price: 8000000, discount_percentage: 0, license_code: 'B2', Created_by: 'admin' },
  ]
  for (const { license_code, ...courseData } of courses) {
    const existing = await prisma.course.findFirst({ where: { name: courseData.name } })
    if (existing) {
      await prisma.course.update({ where: { id: existing.id }, data: { price: courseData.price, discount_percentage: courseData.discount_percentage } })
    } else {
      await prisma.course.create({ data: { ...courseData, license_type_id: licenseTypeMap[license_code] } })
    }
  }
  console.log(' Khóa học:', courses.length, 'items')

  // 4. System settings (Thông tin trung tâm)
  const settings = [
    { setting_key: 'logo_url', setting_value: '/uploads/logo-center.png', description: 'Logo trung tâm' },
    { setting_key: 'hero_image', setting_value: '/uploads/hero-banner.png', description: 'Ảnh banner hero' },
    { setting_key: 'hotline', setting_value: '0939 360 123 - 0962 834 148', description: 'Số điện thoại hotline' },
    { setting_key: 'address', setting_value: 'DX70 - Khu Phố 5 - Định Hoà - Thủ Dầu Một - Bình Dương', description: 'Địa chỉ trung tâm' },
    { setting_key: 'email', setting_value: 'hoangban757@gmail.com', description: 'Email liên hệ' },
    { setting_key: 'facebook', setting_value: 'https://www.facebook.com/daotaolaixebinhduong', description: 'Facebook fanpage' },
    { setting_key: 'facebook_messenger_link', setting_value: 'https://m.me/daotaolaixebinhduong', description: 'Facebook Messenger link' },
    { setting_key: 'zalo_link', setting_value: 'https://zalo.me/0939360123', description: 'Zalo link' },
    { setting_key: 'contact_youtube', setting_value: 'https://www.youtube.com/@channel', description: 'YouTube channel' },
    { setting_key: 'google_map', setting_value: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7832.065732838761!2d106.650734!3d11.036161!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1006a5a4dbf%3A0x47b74a110475396e!2zVsSDbiBQaMOybmcgxJDDoG8gVOG6oW4gTMOsaSBYZSBUaOG6p3kgVGnhur9uIELDuWk!5e0!3m2!1svi!2sus!4v1779358771773!5m2!1svi!2sus', description: 'Google Map embed URL' },
  ]
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { setting_key: s.setting_key },
      update: {},
      create: { ...s, Modify_by: 'system' }
    })
  }
  console.log(' System settings:', settings.length, 'items')
  // 5. Bảng News (Tin tức)
  const newsArticles = [
    { title: 'Hướng dẫn đăng ký thi bằng lái xe B2 online', sapo: 'Hướng dẫn chi tiết cách đăng ký thi bằng lái xe B2 trực tuyến.', content: '<p>Hướng dẫn đăng ký thi bằng lái xe B2 online nhanh chóng.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: '10 mẹo thi lý thuyết lái xe đạt điểm cao', sapo: 'Tổng hợp 10 mẹo giúp vượt qua bài thi lý thuyết dễ dàng.', content: '<p>10 mẹo thi lý thuyết lái xe đạt điểm cao.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Kinh nghiệm thi sa hình B2 đậu ngay lần đầu', sapo: 'Chia sẻ kinh nghiệm từ các học viên đã thi đậu sa hình B2 lần đầu.', content: '<p>Kinh nghiệm thi sa hình B2.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Thay đổi mới trong luật giao thông 2026', sapo: 'Cập nhật các thay đổi quan trọng trong luật giao thông năm 2026.', content: '<p>Thay đổi mới luật giao thông 2026.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'So sánh bằng lái B1 và B2: Nên học hạng nào?', sapo: 'Phân tích ưu nhược điểm giữa B1 và B2.', content: '<p>So sánh B1 và B2.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Chi phí học lái xe B2 năm 2026 là bao nhiêu?', sapo: 'Tổng hợp chi phí học lái xe B2 từ A đến Z.', content: '<p>Chi phí học lái xe B2 năm 2026.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Quy trình đổi bằng lái xe quốc tế', sapo: 'Hướng dẫn quy trình đổi bằng lái xe sang bằng quốc tế.', content: '<p>Quy trình đổi bằng lái quốc tế.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Top 5 lỗi thường gặp khi thi sa hình', sapo: 'Tổng hợp 5 lỗi phổ biến nhất khiến trượt sa hình.', content: '<p>Top 5 lỗi thi sa hình.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Cách lái xe số tự động cho người mới', sapo: 'Hướng dẫn cơ bản lái xe số tự động cho người mới.', content: '<p>Cách lái xe số tự động.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Học lái xe mùa mưa cần lưu ý gì?', sapo: 'Những điều cần biết khi học lái xe trong mưa.', content: '<p>Học lái xe mùa mưa.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Bí quyết đỗ xe song song dễ dàng', sapo: 'Kỹ thuật đỗ xe song song chuẩn xác.', content: '<p>Đỗ xe song song dễ dàng.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Kỹ năng lái xe đường đèo núi an toàn', sapo: 'Kỹ năng cần thiết khi lái xe trên đường đèo.', content: '<p>Lái xe đường đèo núi.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Chuẩn bị gì trước ngày thi sát hạch?', sapo: 'Checklist chuẩn bị trước ngày thi sát hạch.', content: '<p>Chuẩn bị trước ngày thi.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Kinh nghiệm lái xe ban đêm an toàn', sapo: 'Lưu ý quan trọng giúp lái xe an toàn vào ban đêm.', content: '<p>Lái xe ban đêm an toàn.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Ưu đãi đặc biệt dành cho học viên đăng ký nhóm', sapo: 'Giảm giá khi đăng ký nhóm từ 3 người.', content: '<p>Ưu đãi đăng ký nhóm.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Hướng dẫn bảo dưỡng xe ô tô cơ bản', sapo: 'Kiến thức bảo dưỡng mà mọi tài xế nên biết.', content: '<p>Bảo dưỡng xe ô tô.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Tại sao nên học lái xe tại Tiến Bùi?', sapo: 'Ưu điểm và cam kết chất lượng tại trung tâm Tiến Bùi.', content: '<p>Học lái xe tại Tiến Bùi.</p>', status: true, Created_by: 'admin', is_deleted: false },
    { title: 'Thời gian học lái xe B2 mất bao lâu?', sapo: 'Giải đáp thời gian đào tạo và lịch học linh hoạt.', content: '<p>Thời gian học lái xe B2.</p>', status: true, Created_by: 'admin', is_deleted: false },
    {
      title: '5 thông tin cần nắm rõ trước khi đăng ký học bằng lái xe ô tô năm 2026',
      sapo: 'Quy định học và thi bằng lái xe ô tô liên tục được Bộ Giao thông Vận tải cập nhật. Để tránh mất thời gian, chi phí phát sinh và chọn sai hạng bằng, người mới bắt đầu cần nằm lòng những thông tin quan trọng dưới đây.',
      content: `<p>Việc sở hữu một chiếc ô tô cá nhân đang ngày càng trở nên phổ biến tại Việt Nam. Kéo theo đó, nhu cầu học và thi giấy phép lái xe (GPLX) ô tô cũng tăng cao. Tuy nhiên, trước ma trận các trung tâm đào tạo và những thay đổi về luật, nhiều người học tỏ ra lúng túng. Dưới đây là những nội dung trọng tâm bạn cần biết để quá trình học lái xe diễn ra suôn sẻ và hiệu quả.</p>

      <h2>1. Xác định đúng hạng bằng lái cần học (B1 hay B2?)</h2>
      <p>Đây là quyết định đầu tiên và quan trọng nhất, ảnh hưởng trực tiếp đến quá trình học và mục đích sử dụng sau này của bạn. Hiện nay có 2 loại bằng lái phổ biến nhất cho ô tô con chở người đến 9 chỗ ngồi:</p>
      <ul>
        <li><strong>Bằng B1 (Số tự động):</strong> Loại bằng này chỉ cho phép bạn điều khiển xe số tự động (không có chân côn) và đặc biệt là <strong>không được hành nghề kinh doanh vận tải</strong> (như lái xe taxi, xe chạy dịch vụ công nghệ Grab, Be...). Bằng B1 phù hợp với phụ nữ, người lớn tuổi hoặc những ai chỉ có nhu cầu lái xe gia đình, đi làm hàng ngày. Ưu điểm là học và thi dễ hơn do không lo chết máy.</li>
        <li><strong>Bằng B2:</strong> Đây là loại bằng phổ thông hơn, cho phép bạn điều khiển cả xe số sàn và số tự động, và quan trọng là <strong>được phép kinh doanh vận tải</strong>. Bằng B2 phù hợp với nam giới, những người muốn có thêm cơ hội nghề nghiệp hoặc đơn giản là muốn làm chủ hoàn toàn chiếc xe. Tuy nhiên, độ khó khi học và thi thực hành sẽ cao hơn B1 do phải thao tác côn - ga - số nhịp nhàng, đặc biệt là bài đề-pa lên dốc.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop" alt="Học viên đang thực hành lái xe">
        <figcaption>Học viên cần phân biệt rõ nhu cầu để chọn học bằng B1 hoặc B2 cho phù hợp. Ảnh minh họa: Freepik</figcaption>
      </figure>

      <h2>2. Cập nhật quy định thi sát hạch mới nhất</h2>
      <p>Khác với những năm trước, từ năm 2023 trở đi, học viên thi bằng lái xe ô tô phải trải qua quy trình sát hạch nghiêm ngặt hơn với 4 phần thi thay vì 3 phần như trước đây. Sự thay đổi này nhằm nâng cao chất lượng đào tạo và kỹ năng của người lái xe. Cụ thể 4 phần thi bao gồm:</p>
      <ul>
        <li><strong>Thi lý thuyết:</strong> Làm bài trắc nghiệm trên máy tính về Luật Giao thông đường bộ (600 câu hỏi).</li>
        <li><strong>Thi phần mềm mô phỏng các tình huống giao thông:</strong> Đây là nội dung mới, yêu cầu học viên phải xử lý 120 tình huống nguy hiểm trên máy tính.</li>
        <li><strong>Thi thực hành trong hình (Sa hình):</strong> Lái xe qua 11 bài thi liên hoàn trong sân sát hạch với thiết bị chấm điểm tự động.</li>
        <li><strong>Thi thực hành lái xe trên đường trường:</strong> Lái xe trên đường giao thông công cộng thực tế có giám khảo đi cùng và thiết bị giám sát DAT.</li>
      </ul>
      <p>Đặc biệt, một quy định quan trọng là việc áp dụng thiết bị giám sát thời gian và quãng đường học thực hành (DAT). Học viên bắt buộc phải hoàn thành đủ số km và giờ học thực hành theo quy định mới đủ điều kiện dự thi sát hạch: <strong>810km đối với hạng B2</strong> và <strong>710km đối với hạng B1</strong>. Điều này đồng nghĩa với việc bạn phải thực sự dành thời gian để "ôm vô lăng" chứ không thể học qua loa.</p>

      <h2>3. Quy trình học lái xe ô tô chuẩn từ A đến Z</h2>
      <p>Để tránh bỡ ngỡ, bạn nên nắm rõ quy trình đào tạo lái xe ô tô chuẩn hiện nay, thường bao gồm các bước sau:</p>
      <ul>
        <li><strong>Bước 1: Đăng ký và nộp hồ sơ.</strong> Bạn cần chuẩn bị CCCD/CMND, ảnh thẻ 3x4 nền xanh, và quan trọng là Giấy khám sức khỏe dành cho người lái xe (khám tại các cơ sở y tế đủ điều kiện). Sau khi nộp hồ sơ và học phí, bạn sẽ được trung tâm lập thẻ học viên.</li>
        <li><strong>Bước 2: Học lý thuyết.</strong> Bạn sẽ được tham gia các lớp học tập trung về Luật GTĐB, biển báo, sa hình, văn hóa giao thông, cấu tạo và sửa chữa thông thường... Thời gian học lý thuyết thường kéo dài vài buổi. Song song đó, bạn nên tự ôn luyện trên các ứng dụng điện thoại.</li>
        <li><strong>Bước 3: Học thực hành lái xe.</strong> Đây là giai đoạn quan trọng nhất, thường chia làm 3 phần:
          <ul>
            <li><em>Làm quen xe:</em> Học số nguội, cách đánh lái, sử dụng côn, ga, phanh trong bãi phẳng.</li>
            <li><em>Tập lái trong sa hình:</em> Giáo viên sẽ hướng dẫn bạn chi tiết cách thực hiện 11 bài thi sa hình (dốc cầu, hàng đinh, ghép chuồng dọc/ngang...).</li>
            <li><em>Tập lái đường trường (DAT):</em> Bạn sẽ được lái xe ra đường thực tế để hoàn thành đủ số km và giờ học quy định. Đây là cơ hội để rèn luyện kỹ năng xử lý tình huống thực tế.</li>
          </ul>
        </li>
        <li><strong>Bước 4: Thi tốt nghiệp (Thi chứng chỉ sơ cấp nghề).</strong> Kỳ thi này do trung tâm đào tạo tổ chức, có cấu trúc giống kỳ thi sát hạch quốc gia. Vượt qua kỳ thi này, bạn mới đủ điều kiện để dự thi sát hạch.</li>
        <li><strong>Bước 5: Thi sát hạch quốc gia và nhận bằng.</strong> Kỳ thi do Sở GTVT tổ chức. Nếu đạt cả 4 phần thi, bạn sẽ được cấp Giấy phép lái xe sau khoảng 10-15 ngày làm việc.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop" alt="Học viên đang trong giờ học lý thuyết lái xe ô tô">
        <figcaption>Giờ học lý thuyết là nền tảng quan trọng trước khi bước vào thực hành lái xe. Ảnh: Minh họa</figcaption>
      </figure>

      <h2>4. Chi phí học bằng lái xe ô tô năm 2026 - Thực tế và các khoản phát sinh</h2>
      <p>Chi phí là vấn đề được nhiều người quan tâm hàng đầu. Do việc áp dụng công nghệ mới vào giảng dạy và thi cử (cabin mô phỏng, thiết bị DAT) cùng với giá xăng dầu tăng, học phí lái xe đã tăng đáng kể so với trước đây.</p>
      <p><strong>Học phí trọn gói hiện nay:</strong> Trung bình dao động từ <strong>18 triệu đến 22 triệu đồng</strong> cho một khóa học bằng B1 hoặc B2. Mức phí này thường đã bao gồm:</p>
      <ul>
        <li>Phí hồ sơ, lệ phí thi tốt nghiệp và cấp chứng chỉ.</li>
        <li>Lệ phí thi sát hạch quốc gia và lệ phí cấp bằng (lần 1).</li>
        <li>Chi phí đào tạo lý thuyết và thực hành (bao gồm xăng xe, công giáo viên) theo đúng chương trình khung.</li>
        <li>Chi phí tài liệu, đồng phục (tùy trung tâm).</li>
      </ul>
      <p><strong>Các khoản phí có thể phát sinh (Cần lưu ý):</strong></p>
      <ul>
        <li><strong>Phí khám sức khỏe:</strong> Khoảng 300.000 - 500.000 VNĐ (học viên tự đi khám).</li>
        <li><strong>Phí chụp ảnh thẻ:</strong> Khoảng 50.000 VNĐ.</li>
        <li><strong>Phí học bổ túc tay lái (tự nguyện):</strong> Nếu sau thời gian học quy định bạn vẫn chưa tự tin, bạn có thể thuê giáo viên dạy thêm ngoài giờ. Chi phí khoảng 250.000 - 350.000 VNĐ/giờ.</li>
        <li><strong>Phí thuê xe chip (xe cảm ứng):</strong> Trước ngày thi sát hạch, hầu hết học viên đều thuê xe chip để tập trong sân thi cho quen. Chi phí khoảng 400.000 - 500.000 VNĐ/giờ. Đây là khoản đầu tư rất nên làm.</li>
        <li><strong>Phí thi lại:</strong> Nếu không may trượt phần thi nào, bạn sẽ phải đóng lệ phí để thi lại phần đó (thường vài trăm nghìn đồng mỗi phần).</li>
        <li><strong>Tiền "bồi dưỡng" thầy giáo:</strong> Khoản này không bắt buộc và tùy tâm, nhưng là một "luật bất thành văn" ở nhiều nơi để việc học được thuận lợi hơn.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop" alt="Bảng kê chi phí và hợp đồng đào tạo lái xe rõ ràng">
        <figcaption>Hãy yêu cầu trung tâm liệt kê chi tiết các khoản phí trong hợp đồng để tránh phát sinh không mong muốn.</figcaption>
      </figure>

      <h2>5. Mẹo chọn trung tâm đào tạo uy tín và tránh bị lừa đảo</h2>
      <p>Trước nhu cầu học lái xe tăng cao, nhiều trung tâm "ma", văn phòng tuyển sinh "cò mồi" đã mọc lên để lừa đảo học viên với những lời quảng cáo "có cánh" như "Học phí siêu rẻ chỉ 7-8 triệu", "Bao đậu 100%", "Hỗ trợ thi sớm"...</p>
      <p><strong>Hãy tỉnh táo trước những chiêu trò lừa đảo:</strong></p>
      <ul>
        <li><strong>Học phí quá rẻ:</strong> Mức học phí 7-8 triệu là không tưởng trong thời điểm hiện tại. Đây thường là chiêu trò để dụ bạn đóng tiền cọc, sau đó sẽ phát sinh vô số khoản phí khác hoặc cắt xén giờ học của bạn.</li>
        <li><strong>Cam kết "Bao đậu":</strong> Với quy trình thi sát hạch được giám sát chặt chẽ bằng camera và thiết bị điện tử của Bộ GTVT hiện nay, hoàn toàn <strong>không có chuyện bao đậu hay chống trượt</strong>. Mọi kết quả đều dựa trên năng lực thực tế của bạn.</li>
      </ul>
      <p><strong>Tiêu chí chọn trung tâm đào tạo uy tín:</strong></p>
      <ul>
        <li><strong>Có giấy phép hoạt động:</strong> Trung tâm phải được Sở Giao thông Vận tải cấp phép đào tạo. Bạn có thể tra cứu thông tin này trên website của Sở GTVT địa phương.</li>
        <li><strong>Cơ sở vật chất tốt:</strong> Hãy đến trực tiếp trung tâm để tham quan. Một trung tâm uy tín sẽ có hệ thống phòng học lý thuyết khang trang, sân tập lái đạt chuẩn (đủ 11 bài thi), dàn xe tập lái đời mới, an toàn và có trang bị cabin mô phỏng.</li>
        <li><strong>Hợp đồng rõ ràng:</strong> Mọi cam kết về học phí, thời gian đào tạo, số giờ học thực hành, địa điểm học... đều phải được ghi rõ trong Hợp đồng đào tạo có dấu đỏ của trung tâm. Đọc kỹ hợp đồng trước khi ký.</li>
        <li><strong>Tham khảo ý kiến:</strong> Hỏi người thân, bạn bè đã từng học lái xe để có những đánh giá khách quan nhất. Bạn cũng có thể tìm kiếm thông tin trên các diễn đàn, hội nhóm uy tín về ô tô.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop" alt="Mặt tiền của một trung tâm đào tạo lái xe uy tín và hiện đại">
        <figcaption>Lựa chọn một trung tâm đào tạo uy tín là bước khởi đầu quan trọng cho hành trình lái xe an toàn của bạn.</figcaption>
      </figure>

      <p>Tóm lại, việc học và thi bằng lái xe ô tô là một quá trình đòi hỏi sự đầu tư nghiêm túc về cả thời gian, công sức và tiền bạc. Nắm vững 5 thông tin quan trọng trên sẽ giúp bạn có sự chuẩn bị tốt nhất, tránh được những rủi ro không đáng có và sớm cầm trên tay tấm Giấy phép lái xe mơ ước.</p>`,
      status: true,
      Created_by: 'admin',
      is_deleted: false
    },
    {
      title: 'Mẹo vượt qua phần mềm mô phỏng 120 tình huống giao thông (Cập nhật mới nhất 2026)',
      sapo: 'Thi mô phỏng lái xe là nỗi ám ảnh của nhiều học viên. Bài viết này tổng hợp các bí kíp và phương pháp canh điểm chuẩn xác giúp bạn tự tin đạt điểm tuyệt đối.',
      content: `<p>Từ khi được chính thức áp dụng vào quy trình sát hạch cấp Giấy phép lái xe, phần thi mô phỏng 120 tình huống giao thông đã khiến tỉ lệ trượt của học viên tăng lên đáng kể. Khác với thi lý thuyết có thể học thuộc lòng luật, hay thi thực hành yêu cầu kỹ năng tay chân, phần thi mô phỏng đòi hỏi sự tập trung cao độ, khả năng quan sát nhạy bén và quan trọng nhất là "bấm đúng lúc".</p>
        
        <p>Nhiều học viên phàn nàn rằng dù nhìn thấy nguy hiểm nhưng bấm phím Space vẫn bị 0 điểm vì... bấm quá sớm hoặc quá trễ. Để khắc phục điều này, chúng ta cần hiểu rõ cơ chế chấm điểm và có chiến thuật ôn luyện phù hợp.</p>

        <h2>1. Hiểu rõ cơ chế chấm điểm của phần mềm mô phỏng</h2>
        <p>Bài thi mô phỏng bao gồm 10 tình huống được chọn ngẫu nhiên từ bộ 120 tình huống. Mỗi tình huống có thang điểm từ 5 (cao nhất) xuống 0 (thấp nhất).</p>
        <ul>
            <li><strong>Điểm 5:</strong> Bạn bấm phím Space (dấu cách) ngay tại thời điểm nhận diện được nguy hiểm bắt đầu xuất hiện.</li>
            <li><strong>Điểm 4, 3, 2, 1:</strong> Bạn bấm phím Space muộn hơn mốc điểm 5. Càng muộn, điểm càng thấp.</li>
            <li><strong>Điểm 0:</strong> Xảy ra trong 2 trường hợp: <br/>- Bấm <strong>quá sớm</strong> (khi nguy hiểm chưa thực sự rõ ràng theo quy định của phần mềm).<br/>- Bấm <strong>quá muộn</strong> (khi tai nạn đã xảy ra) hoặc <strong>không bấm</strong>.</li>
        </ul>
        <p><strong>Lưu ý quan trọng:</strong> Tổng điểm tối đa của 10 tình huống là 50 điểm. Để vượt qua phần thi này, bạn cần đạt tối thiểu <strong>35/50 điểm</strong>. Nếu để trượt phần mô phỏng, bạn sẽ không được thi tiếp phần thực hành sa hình.</p>

        <figure>
            <img src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop" alt="Học viên đang ôn luyện thi mô phỏng trên máy tính">
            <figcaption>Tập trung cao độ và canh đúng "điểm rơi" là chìa khóa vượt qua bài thi mô phỏng. Ảnh: Minh họa</figcaption>
        </figure>

        <h2>2. Phân loại 120 tình huống để ôn luyện hiệu quả</h2>
        <p>Học vẹt cả 120 tình huống là một thử thách lớn. Thay vào đó, bạn nên nhóm chúng lại thành các nhóm có dấu hiệu nhận biết tương tự nhau. Phần mềm được chia làm 6 chương, cụ thể:</p>
        
        <h3>Chương 1: Giao thông trên đường đô thị (29 tình huống)</h3>
        <p>Đây là chương có nhiều tình huống phức tạp và thực tế nhất. Dấu hiệu nhận biết thường là:</p>
        <ul>
            <li><strong>Người đi bộ qua đường:</strong> Bấm khi người đi bộ bước một chân xuống lòng đường hoặc vừa khuất sau đuôi xe tải, xe buýt.</li>
            <li><strong>Xe máy tạt đầu, lấn làn:</strong> Bấm khi bánh trước xe máy vừa chạm vạch phân làn hoặc xe máy vừa nhô ra từ ngõ khuất.</li>
            <li><strong>Mở cửa xe bất ngờ:</strong> Bấm khi đèn xi nhan xe đỗ bật sáng hoặc cửa xe hé mở.</li>
        </ul>

        <h3>Chương 2: Giao thông trên đường nông thôn, đường hẹp (14 tình huống)</h3>
        <p>Đặc trưng của chương này là tầm nhìn hạn chế, đường cong và có động vật.</p>
        <ul>
            <li><strong>Gia súc (bò) trên đường:</strong> Bấm khi thấy chân con bò di chuyển hoặc bò vừa bước qua cọc tiêu giao thông.</li>
            <li><strong>Trẻ em chơi đùa:</strong> Bấm khi trẻ em chạy từ lề đường ra.</li>
        </ul>

        <h3>Chương 3: Giao thông trên đường cao tốc (20 tình huống)</h3>
        <p>Tốc độ cao đòi hỏi phản xạ phải cực nhanh, nhưng cũng rất dễ bị 0 điểm do bấm sớm.</p>
        <ul>
            <li><strong>Xe phía trước phanh gấp:</strong> Dấu hiệu "vàng" là đèn phanh (đèn hậu màu đỏ) của xe phía trước vừa bật sáng. <strong>Hãy đợi đèn sáng hẳn mới bấm!</strong></li>
            <li><strong>Xe chuyển làn, nhập làn:</strong> Bấm khi bánh xe của xe đó đè lên vạch đứt phân làn.</li>
        </ul>

        <figure>
            <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop" alt="Giao thông trên đường cao tốc cần phản xạ nhanh">
            <figcaption>Trên đường cao tốc, hãy đặc biệt chú ý đến đèn phanh của xe phía trước. Ảnh: Freepik</figcaption>
        </figure>

        <h3>Chương 4: Giao thông trên đường núi (10 tình huống)</h3>
        <p>Chủ yếu là đường đèo dốc, sương mù và nguy cơ sạt lở.</p>
        <ul>
            <li><strong>Xe vượt ẩu ở khúc cua:</strong> Bấm ngay khi thấy đầu xe ngược chiều nhô ra khỏi khúc cua mù.</li>
            <li><strong>Đất đá sạt lở:</strong> Bấm khi viên đá đầu tiên bắt đầu rơi.</li>
        </ul>

        <h3>Chương 5: Giao thông trên Quốc lộ (17 tình huống)</h3>
        <p>Tương tự chương 1 nhưng tốc độ cao hơn, liên quan nhiều đến xe tải, xe khách.</p>
        <ul>
            <li><strong>Người đi bộ/xe đạp cắt ngang:</strong> Canh vị trí họ so với cột mốc, cọc tiêu hoặc bóng râm trên đường.</li>
        </ul>

        <h3>Chương 6: Tình huống giao thông hỗn hợp (30 tình huống)</h3>
        <p>Đây là phần tổng hợp các tình huống tai nạn thực tế. Dấu hiệu rất đa dạng.</p>
        <ul>
            <li><strong>Xe lùi trên cao tốc:</strong> Bấm khi đèn lùi (màu trắng) sáng.</li>
            <li><strong>Xe chở hàng cồng kềnh, rơi vãi:</strong> Bấm khi thấy đồ vật có dấu hiệu rời khỏi xe.</li>
        </ul>

        <h2>3. Chiến thuật "Ăn chắc mặc bền" - Thà 4 điểm còn hơn 0 điểm</h2>
        <p>Một sai lầm rất phổ biến của học viên là cố gắng lấy trọn 5 điểm ở mọi tình huống. Khi tâm lý căng thẳng trong phòng thi, việc cố bắt điểm 5 rất dễ dẫn đến phản xạ bấm quá sớm trước vạch xuất phát của phần mềm, kết quả là bạn nhận 0 điểm.</p>
        <p><strong>Chiến thuật tối ưu:</strong> Hãy luyện tập sao cho điểm rơi của bạn luôn nằm ở khoảng <strong>cuối điểm 5, đầu điểm 4</strong>. Ví dụ, nếu mẹo là "bấm khi đèn phanh sáng", hãy để đèn phanh sáng rõ khoảng nửa giây rồi mới gõ phím Space. Việc lùi thời điểm bấm lại một chút giúp bạn an toàn lọt vào vùng có điểm (4 hoặc 3 điểm), đảm bảo tích lũy đủ 35 điểm để qua môn thay vì rủi ro trượt oan.</p>

        <figure>
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop" alt="Sử dụng máy tính để ôn thi mô phỏng">
            <figcaption>Nên ôn luyện trên máy tính thay vì điện thoại để làm quen với phím Space. Ảnh: Unsplash</figcaption>
        </figure>

        <h2>4. Lời khuyên thiết thực khi ôn luyện và làm bài thi</h2>
        <ol>
            <li><strong>Không học thuộc lòng video:</strong> Nhiều tình huống có bối cảnh giống hệt nhau nhưng thời điểm xảy ra nguy hiểm lại khác nhau (ví dụ: cùng là đường cao tốc, nhưng một video xe phanh gấp, một video xe chuyển làn). Hãy học theo dấu hiệu nhận biết, không học theo bối cảnh.</li>
            <li><strong>Sử dụng phần mềm chuẩn của Tổng cục Đường bộ:</strong> Hãy tải và cài đặt phần mềm mô phỏng V2.0.0 (phiên bản cập nhật mới nhất) trực tiếp trên máy tính. Các app trên điện thoại có thể bị sai lệch độ trễ (delay), khiến bạn quen tay sai nhịp.</li>
            <li><strong>Tập thói quen đặt tay lên phím Space:</strong> Trong phòng thi, tay không cầm chuột mà hãy đặt nhẹ một ngón lên phím Space bar. Mắt tập trung vào khu vực trung tâm màn hình, không nhìn đi nơi khác.</li>
            <li><strong>Giữ tâm lý bình tĩnh:</strong> Nếu lỡ bấm trượt một tình huống và biết mình bị 0 điểm, hãy hít thở sâu và tập trung ngay vào tình huống tiếp theo. Đừng để tâm lý hoang mang làm hỏng cả bài thi, vì bạn có tới 10 tình huống để gỡ điểm.</li>
        </ol>

        <p>Phần thi mô phỏng không thực sự quá đáng sợ nếu bạn đầu tư thời gian ôn luyện nghiêm túc và có phương pháp đúng đắn. Hãy coi đây là một trò chơi rèn luyện phản xạ, thay vì một gánh nặng tâm lý. Chúc bạn ôn tập tốt và đạt kết quả cao trong kỳ thi sát hạch sắp tới!</p>`,
      status: true,
      Created_by: 'admin',
      is_deleted: false
    },
  ]

  for (const news of newsArticles) {
    const existingNews = await prisma.news.findFirst({
      where: { title: news.title }
    });
    
    if (existingNews) {
      await prisma.news.update({
        where: { id: existingNews.id },
        data: {
          thumbnail_image: news.thumbnail_image,
          sapo: news.sapo,
          content: news.content,
          status: news.status,
          Created_by: news.Created_by,
          is_deleted: news.is_deleted
        }
      });
    } else {
      await prisma.news.create({
        data: news
      });
    }
  }
  console.log(' News:', newsArticles.length, 'items')

  console.log('')
  console.log('Seed hoàn tất!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(' Đăng nhập admin:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => {
    console.error(' Lỗi seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
