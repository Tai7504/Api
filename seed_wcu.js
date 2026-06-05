const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const stats = [
    { value: '5,000+', label: 'HỌC VIÊN' },
    { value: '98%', label: 'ĐẬU SÁT HẠCH' },
    { value: '10+', label: 'NĂM KN' }
  ];

  const features = [
    { icon: 'directions_car', title: 'Dàn Xe Đời Mới', desc: '100% xe 2023-2024, số tự động & số sàn, trang bị phanh phụ an toàn.' },
    { icon: 'school', title: 'Giáo Viên 10+ Năm', desc: 'Kiên nhẫn, phương pháp dễ hiểu, đào tạo 1 kèm 1 trong suốt khóa học.' },
    { icon: 'analytics', title: 'Sân Tập Chuẩn Thi', desc: 'Mô phỏng 11 bài sa hình thực tế có gắn chip chấm điểm tự động.' },
    { icon: 'schedule', title: 'Lịch Học Linh Hoạt', desc: 'Học cả T7, CN theo lịch cá nhân. Rảnh giờ nào đặt lịch học giờ đó.' }
  ];

  const settings = [
    { setting_key: 'wcu_title', setting_value: 'Vì Sao Hơn 5,000+ Học Viên Chọn Chúng Tôi?' },
    { setting_key: 'wcu_description', setting_value: 'Với triết lý giáo dục đặt sự an toàn và kỹ năng thực tế lên hàng đầu, chúng tôi mang đến môi trường học tập chuyên nghiệp. Cam kết bạn không chỉ có bằng lái, mà còn tự tin làm chủ mọi cung đường.' },
    { setting_key: 'wcu_image', setting_value: '/uploads/wcu-banner.jpg' },
    { setting_key: 'wcu_stats', setting_value: JSON.stringify(stats) },
    { setting_key: 'wcu_features', setting_value: JSON.stringify(features) }
  ];

  for (const item of settings) {
    await prisma.systemSetting.upsert({
      where: { setting_key: item.setting_key },
      update: { setting_value: item.setting_value },
      create: { setting_key: item.setting_key, setting_value: item.setting_value, description: 'Why Choose Us settings' },
    });
  }
  console.log('Done seeding Why Choose Us data');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
