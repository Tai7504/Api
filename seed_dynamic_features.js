const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const features = [
    { title: 'Đào tạo chuyên nghiệp', desc: 'Giáo trình cập nhật liên tục, thực hành thực tế, đảm bảo tự tin cầm lái.' },
    { title: 'Hỗ trợ trọn đời', desc: 'Tư vấn kỹ thuật và kỹ năng lái xe ngay cả sau khi đã nhận bằng.' }
  ];

  await prisma.systemSetting.upsert({
    where: { setting_key: 'about_features' },
    update: { setting_value: JSON.stringify(features) },
    create: { setting_key: 'about_features', setting_value: JSON.stringify(features), description: 'Dynamic features list' },
  });
  console.log('Done seeding dynamic features');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
