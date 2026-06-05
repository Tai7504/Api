const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const settings = [
    { setting_key: 'about_text_1', setting_value: 'Tại trung tâm, chúng tôi không chỉ dừng lại ở việc giúp học viên thi đậu lấy bằng mà còn là hành trang kiến thức vững vàng trên mọi nẻo đường.' },
    { setting_key: 'about_text_2', setting_value: 'Với đội ngũ giáo viên trên 10 năm kinh nghiệm, tận tâm, chúng tôi cam kết mang lại trải nghiệm học tập tốt nhất, an toàn và hiệu quả.' },
    { setting_key: 'about_image', setting_value: '/uploads/about-banner.jpg' },
    { setting_key: 'about_feature_1_title', setting_value: 'Đào tạo chuyên nghiệp' },
    { setting_key: 'about_feature_1_desc', setting_value: 'Giáo trình cập nhật liên tục, thực hành thực tế, đảm bảo tự tin cầm lái.' },
    { setting_key: 'about_feature_2_title', setting_value: 'Hỗ trợ trọn đời' },
    { setting_key: 'about_feature_2_desc', setting_value: 'Tư vấn kỹ thuật và kỹ năng lái xe ngay cả sau khi đã nhận bằng.' },
  ];

  for (const item of settings) {
    await prisma.systemSetting.upsert({
      where: { setting_key: item.setting_key },
      update: { setting_value: item.setting_value },
      create: { setting_key: item.setting_key, setting_value: item.setting_value, description: 'Default seeded data' },
    });
  }
  console.log('Done seeding about us settings');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
